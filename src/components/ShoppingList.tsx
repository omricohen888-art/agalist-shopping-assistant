import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";
import { ShoppingItem, ISRAELI_STORES } from "@/types/shopping";
import { saveShoppingHistory } from "@/utils/storage";
export const ShoppingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [customStore, setCustomStore] = useState("");
  const handlePaste = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false
    }));
    setItems([...items, ...newItems]);
    setInputText("");
    toast.success(`נוספו ${newItems.length} פריטים`);
  };
  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? {
      ...item,
      checked: !item.checked
    } : item));
  };
  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  const shareList = async () => {
    const listText = items.map(item => `${item.checked ? "✓" : "○"} ${item.text}`).join("\n");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "רשימת קניות - עגליסט",
          text: listText
        });
        toast.success("הרשימה שותפה בהצלחה!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(listText);
        }
      }
    } else {
      copyToClipboard(listText);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("הרשימה הועתקה ללוח!");
  };
  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked));
    toast.success("פריטים שסומנו נמחקו");
  };
  const clearAll = () => {
    setItems([]);
    toast.success("הרשימה נוקתה");
  };
  const openFinishDialog = () => {
    if (items.length === 0) {
      toast.error("אין פריטים ברשימה");
      return;
    }
    setIsFinishDialogOpen(true);
  };
  const handleFinishShopping = () => {
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("אנא הזן סכום תקין");
      return;
    }
    const store = selectedStore === "אחר" ? customStore : selectedStore;
    if (!store) {
      toast.error("אנא בחר רשת שיווק");
      return;
    }
    const completedItems = items.filter(item => item.checked).length;
    const history = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...items],
      totalAmount: amount,
      store,
      completedItems,
      totalItems: items.length
    };
    if (saveShoppingHistory(history)) {
      toast.success("הקנייה נשמרה בהצלחה!");
      setItems([]);
      setInputText("");
      setTotalAmount("");
      setSelectedStore("");
      setCustomStore("");
      setIsFinishDialogOpen(false);
    } else {
      toast.error("שגיאה בשמירת הקנייה");
    }
  };
  const completedCount = items.filter(item => item.checked).length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  return <div className="min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold">🛒 עגליסט</h1>
            <Button variant="ghost" onClick={() => navigate("/history")} className="h-10 px-4 font-semibold text-primary-foreground hover:bg-primary-foreground/10">
              <History className="ml-2 h-5 w-5" />
              היסטוריה
            </Button>
          </div>
          {items.length > 0 && <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2 bg-primary-foreground/20" />
              <p className="text-sm text-primary-foreground/90 text-center">
                {completedCount} מתוך {items.length} פריטים הושלמו
              </p>
            </div>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Input Area */}
        <div className="bg-card rounded-2xl shadow-md border border-border p-4 mb-6">
          <Textarea placeholder="הדביקו את הרשימה כאן (פריט בכל שורה)..." value={inputText} onChange={e => setInputText(e.target.value)} className="min-h-[120px] resize-none bg-background border border-input focus:border-primary transition-colors text-base" />
          <div className="flex gap-2 mt-3">
            <Button onClick={shareList} disabled={items.length === 0} variant="outline" size="sm" className="flex-1">
              <Share2 className="ml-2 h-4 w-4" />
              שתף
            </Button>
            <Button onClick={clearAll} disabled={items.length === 0} variant="outline" size="sm" className="flex-1">
              <Trash2 className="ml-2 h-4 w-4" />
              נקה הכל
            </Button>
          </div>
        </div>

        {/* List Items */}
        {items.length === 0 ? <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-muted-foreground text-lg">
              אין פריטים עדיין. הדביקו רשימה או הוסיפו פריטים כדי להתחיל.
            </p>
          </div> : <div className="space-y-3">
            {items.map((item, index) => <div key={item.id} className="bg-card rounded-xl shadow-sm border border-border p-4 flex items-center gap-3 group hover:shadow-md transition-all animate-slide-up" style={{
          animationDelay: `${index * 30}ms`
        }}>
                <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id)} className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all" />
                <span className={`flex-1 text-base transition-all ${item.checked ? "completed-item" : "text-foreground font-medium"}`}>
                  {item.text}
                </span>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>)}
            {items.some(item => item.checked) && <div className="pt-4 flex gap-3">
                <Button variant="outline" onClick={clearCompleted} className="flex-1 h-11 font-semibold">
                  נקה פריטים שסומנו
                </Button>
                <Button onClick={openFinishDialog} className="flex-1 h-11 font-semibold bg-primary hover:bg-primary/90">
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                  סיום קנייה
                </Button>
              </div>}
          </div>}
      </div>

      {/* FAB Button */}
      <Button onClick={() => handlePaste(inputText)} disabled={!inputText.trim()} className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-20 p-0">
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">סיום קנייה</DialogTitle>
            <DialogDescription className="text-base">
              הזן את פרטי הקנייה כדי לשמור אותה בהיסטוריה
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                סכום הקנייה (₪)
              </Label>
              <Input id="amount" type="number" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="h-12 text-lg" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store" className="text-base font-semibold">
                רשת שיווק
              </Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="בחר רשת שיווק" />
                </SelectTrigger>
                <SelectContent>
                  {ISRAELI_STORES.map(store => <SelectItem key={store} value={store} className="text-lg">
                      {store}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedStore === "אחר" && <div className="space-y-2">
                <Label htmlFor="customStore" className="text-base font-semibold">
                  שם הרשת
                </Label>
                <Input id="customStore" type="text" placeholder="הזן שם רשת" value={customStore} onChange={e => setCustomStore(e.target.value)} className="h-12 text-lg" />
              </div>}
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">סיכום:</p>
              <p className="text-lg font-semibold">
                {items.filter(item => item.checked).length} מתוך {items.length} פריטים הושלמו
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)} className="h-11 px-6">
              ביטול
            </Button>
            <Button onClick={handleFinishShopping} className="h-11 px-6 bg-success hover:bg-success/90">
              <CheckCircle2 className="ml-2 h-4 w-4" />
              שמור קנייה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
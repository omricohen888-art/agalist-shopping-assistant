import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, CheckCircle2, History, Menu, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ShoppingItem, ISRAELI_STORES } from "@/types/shopping";
import { saveShoppingHistory } from "@/utils/storage";
import { useLanguage, Language } from "@/hooks/use-language";

const ENGLISH_STORES = [
  "Shufersal",
  "Rami Levy",
  "Victory",
  "Yenot Bitan",
  "Machsanei HaShuk",
  "Super-Pharm",
  "Shufersal Deal",
  "AM:PM",
  "Yohannoff",
  "Mega Ba'Ir",
  "Tiv Taam",
  "Cofix",
  "Hazi Hinam",
  "Other"
] as const;

// Template data for quick start
const templates = {
  he: [
    { id: "grocery", name: "השלמות למכולת", items: ["חלב", "לחם", "קוטג'", "ביצים", "עגבניות"] },
    { id: "hiking", name: "ציוד לטיול", items: ["פינג'אן", "קפה שחור", "אוהל", "שק שינה", "בקבוקי מים", "קרם הגנה", "פנס", "מפית לחות"] },
    { id: "tech", name: "אלקטרוניקה וגאדג'טים", items: ["כבל HDMI", "סוללות AA", "מטען USB-C", "עכבר", "מקלדת", "אוזניות"] },
    { id: "bbq", name: "על האש", items: ["פחמים", "סטייקים", "קבב", "חומוס", "פיתות", "סלטים", "מלקחיים", "מלח גס"] },
    { id: "cleaning", name: "ניקיון ופארם", items: ["אקונומיקה", "נוזל רצפות", "שמפו", "משחת שיניים", "אבקת כביסה", "סבון ידיים", "נייר טואלט"] },
    { id: "family", name: "קנייה משפחתית גדולה", items: ["שניצל", "פסטה", "אורז", "מלפפונים", "פלפלים", "מילקי", "גבינה צהובה", "במבה", "ביסלי", "פיצה קפואה", "חזה עוף", "שמן", "קורנפלקס", "נייר טואלט", "יוגורט", "לחם", "חלב"] }
  ],
  en: [
    { id: "grocery", name: "Small Run", items: ["Milk", "Bread", "Cottage Cheese", "Eggs", "Tomatoes"] },
    { id: "hiking", name: "Hiking/Camping", items: ["Finjan", "Black Coffee", "Tent", "Sleeping Bag", "Water bottles", "Sunscreen", "Flashlight", "Wet wipes"] },
    { id: "tech", name: "Tech & Gadgets", items: ["HDMI Cable", "AA Batteries", "USB-C Charger", "Mouse", "Keyboard", "Headphones"] },
    { id: "bbq", name: "BBQ", items: ["Charcoal", "Steaks", "Kebabs", "Hummus", "Pita bread", "Salads", "Tongs", "Coarse salt"] },
    { id: "cleaning", name: "Cleaning & Pharmacy", items: ["Bleach", "Floor cleaner", "Shampoo", "Toothpaste", "Laundry detergent", "Hand soap", "Toilet paper"] },
    { id: "family", name: "Big Family Shop", items: ["Schnitzel", "Pasta", "Rice", "Cucumbers", "Peppers", "Milky", "Yellow Cheese", "Bamba", "Bisli", "Frozen Pizza", "Chicken breast", "Oil", "Cereal", "Toilet paper", "Yogurt", "Bread", "Milk"] }
  ]
};

const translations: Record<Language, {
  languageLabel: string;
  languageAria: string;
  appTitle: string;
  tagline: string;
  fabLabel: string;
  menuTitle: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  templatesHeading: string;
  addItemButton: string;
  addItemPlaceholder: string;
  navigation: {
    list: string;
    history: string;
    compare: string;
  };
  shareTitle: string;
  textareaPlaceholder: string;
  shareButton: string;
  clearAllButton: string;
  emptyState: string;
  clearCompletedButton: string;
  finishButton: string;
  finishDialogTitle: string;
  finishDialogDescription: string;
  amountLabel: string;
  storeLabel: string;
  selectPlaceholder: string;
  customStoreLabel: string;
  customStorePlaceholder: string;
  summaryLabel: string;
  cancel: string;
  save: string;
  progressText: (completed: number, total: number) => string;
  toasts: {
    itemsAdded: (count: number) => string;
    shareSuccess: string;
    copySuccess: string;
    clearedCompleted: string;
    clearedAll: string;
    noItems: string;
    invalidAmount: string;
    selectStore: string;
    saveSuccess: string;
    saveError: string;
  };
}> = {
  he: {
    languageLabel: "English",
    languageAria: "Switch to English",
    appTitle: "עגליסט",
    tagline: "רושמת, מארגנת וחוסכת!",
    fabLabel: "להוספת הרשימה לחץ כאן",
    menuTitle: "🛒 תפריט",
    welcomeHeading: "שלחו לכם רשימת קניות?",
    welcomeSubtitle: "הדביקו אותה כאן וקבלו חוויית קנייה מהנה, אינטראקטיבית וחסכונית.",
    templatesHeading: "אין לכם רשימה? נסו אחת לדוגמה:",
    addItemButton: "הוסף פריט",
    addItemPlaceholder: "שם הפריט...",
    navigation: {
      list: "רשימת קניות",
      history: "היסטוריה",
      compare: "השוואת קניות"
    },
    shareTitle: "רשימת קניות - עגליסט",
    textareaPlaceholder: "הדביקו את הרשימה כאן (פריט בכל שורה)...",
    shareButton: "שתף",
    clearAllButton: "נקה הכל",
    emptyState: "אין פריטים עדיין. הדביקו רשימה או הוסיפו פריטים כדי להתחיל.",
    clearCompletedButton: "נקה פריטים שסומנו",
    finishButton: "סיום קנייה",
    finishDialogTitle: "סיום קנייה",
    finishDialogDescription: "הזן את פרטי הקנייה כדי לשמור אותה בהיסטוריה",
    amountLabel: "סכום הקנייה (₪)",
    storeLabel: "רשת שיווק",
    selectPlaceholder: "בחר רשת שיווק",
    customStoreLabel: "שם הרשת",
    customStorePlaceholder: "הזן שם רשת",
    summaryLabel: "סיכום:",
    cancel: "ביטול",
    save: "שמור קנייה",
    progressText: (completed: number, total: number) => `${completed} מתוך ${total} פריטים הושלמו`,
    toasts: {
      itemsAdded: (count: number) => `נוספו ${count} פריטים`,
      shareSuccess: "הרשימה שותפה בהצלחה!",
      copySuccess: "הרשימה הועתקה ללוח!",
      clearedCompleted: "פריטים שסומנו נמחקו",
      clearedAll: "הרשימה נוקתה",
      noItems: "אין פריטים ברשימה",
      invalidAmount: "אנא הזן סכום תקין",
      selectStore: "אנא בחר רשת שיווק",
      saveSuccess: "הקנייה נשמרה בהצלחה!",
      saveError: "שגיאה בשמירת הקנייה"
    }
  },
  en: {
    languageLabel: "עברית",
    languageAria: "Switch to Hebrew",
    appTitle: "ShoppingList",
    tagline: "Smart lists. Organized shopping.",
    fabLabel: "Tap here to add your list",
    menuTitle: "🛒 Menu",
    welcomeHeading: "Got a list?",
    welcomeSubtitle: "Paste it here. We'll handle the rest.",
    templatesHeading: "No list? Try a sample:",
    addItemButton: "Add Item",
    addItemPlaceholder: "Item name...",
    navigation: {
      list: "Shopping list",
      history: "History",
      compare: "Compare prices"
    },
    shareTitle: "Shopping List - Agalist",
    textareaPlaceholder: "Paste your list here (one item per line)...",
    shareButton: "Share",
    clearAllButton: "Clear all",
    emptyState: "No items yet. Paste a list or add items to get started.",
    clearCompletedButton: "Remove checked items",
    finishButton: "Finish shopping",
    finishDialogTitle: "Finish shopping",
    finishDialogDescription: "Enter the purchase details so we can save them to your history.",
    amountLabel: "Purchase amount (₪)",
    storeLabel: "Grocery chain",
    selectPlaceholder: "Choose a grocery chain",
    customStoreLabel: "Chain name",
    customStorePlaceholder: "Enter a chain name",
    summaryLabel: "Summary:",
    cancel: "Cancel",
    save: "Save purchase",
    progressText: (completed: number, total: number) => `${completed} of ${total} items completed`,
    toasts: {
      itemsAdded: (count: number) => `Added ${count} items`,
      shareSuccess: "List shared successfully!",
      copySuccess: "List copied to clipboard!",
      clearedCompleted: "Checked items removed",
      clearedAll: "List cleared",
      noItems: "No items in the list",
      invalidAmount: "Please enter a valid amount",
      selectStore: "Please choose a store",
      saveSuccess: "Purchase saved successfully!",
      saveError: "Failed to save purchase"
    }
  }
};

const heToEnStoreMap = ISRAELI_STORES.reduce((acc, store, index) => {
  acc[store] = ENGLISH_STORES[index];
  return acc;
}, {} as Record<string, string>);

const enToHeStoreMap = ENGLISH_STORES.reduce((acc, store, index) => {
  acc[store] = ISRAELI_STORES[index];
  return acc;
}, {} as Record<string, string>);
export const ShoppingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [customStore, setCustomStore] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const storeOptions = language === "he" ? ISRAELI_STORES : ENGLISH_STORES;
  const otherLabel = language === "he" ? "אחר" : "Other";
  const direction = language === "he" ? "rtl" : "ltr";
  const currentTemplates = templates[language];

  const [singleItemInput, setSingleItemInput] = useState("");

  useEffect(() => {
    setSelectedStore(prev => {
      if (!prev) {
        return prev;
      }
      if (language === "en" && heToEnStoreMap[prev]) {
        return heToEnStoreMap[prev];
      }
      if (language === "he" && enToHeStoreMap[prev]) {
        return enToHeStoreMap[prev];
      }
      return prev;
    });
  }, [language]);

  const handlePaste = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false
    }));
    setItems([...items, ...newItems]);
    setInputText("");
    toast.success(t.toasts.itemsAdded(newItems.length));
  };

  const handleTemplateClick = (templateItems: string[]) => {
    const templateText = templateItems.join("\n");
    setInputText(templateText);
  };

  const handleAddSingleItem = () => {
    if (!singleItemInput.trim()) return;
    const newItem: ShoppingItem = {
      id: `${Date.now()}`,
      text: singleItemInput.trim(),
      checked: false
    };
    setItems([...items, newItem]);
    setSingleItemInput("");
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
          title: t.shareTitle,
          text: listText
        });
        toast.success(t.toasts.shareSuccess);
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
    toast.success(t.toasts.copySuccess);
  };
  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked));
    toast.success(t.toasts.clearedCompleted);
  };
  const clearAll = () => {
    setItems([]);
    setInputText("");
    toast.success(t.toasts.clearedAll);
  };
  const openFinishDialog = () => {
    if (items.length === 0) {
      toast.error(t.toasts.noItems);
      return;
    }
    setIsFinishDialogOpen(true);
  };
  const handleFinishShopping = () => {
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t.toasts.invalidAmount);
      return;
    }
    const store = selectedStore === otherLabel ? customStore : selectedStore;
    if (!store) {
      toast.error(t.toasts.selectStore);
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
      toast.success(t.toasts.saveSuccess);
      setItems([]);
      setInputText("");
      setTotalAmount("");
      setSelectedStore("");
      setCustomStore("");
      setIsFinishDialogOpen(false);
    } else {
      toast.error(t.toasts.saveError);
    }
  };
  const completedCount = items.filter(item => item.checked).length;
  const progressPercentage = items.length > 0 ? completedCount / items.length * 100 : 0;
  return <div className="min-h-screen pb-32 animate-fade-in" dir={direction} lang={language}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <div className={`flex items-center gap-0.5 text-2xl sm:text-3xl font-bold drop-shadow-md leading-tight ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}>
                <span>{t.appTitle}</span>
                <span className="text-3xl sm:text-4xl">🛒</span>
                <span className="text-green-500 text-3xl sm:text-4xl font-bold leading-none">✓</span>
              </div>
              <p className="text-sm sm:text-base text-primary-foreground/90 font-semibold">{t.tagline}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={toggleLanguage} aria-label={t.languageAria} className="h-8 px-2 text-xs font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                {t.languageLabel}
              </Button>
              {/* Hamburger Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 text-primary-foreground hover:bg-primary-foreground/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="text-2xl">{t.menuTitle}</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-3 mt-8">
                    <Button variant="outline" onClick={() => navigate("/")} className="h-14 justify-start text-lg font-semibold">
                      <Plus className="ml-3 h-5 w-5" />
                      {t.navigation.list}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/history")} className="h-14 justify-start text-lg font-semibold">
                      <History className="ml-3 h-5 w-5" />
                      {t.navigation.history}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/compare")} className="h-14 justify-start text-lg font-semibold">
                      <BarChart3 className="ml-3 h-5 w-5" />
                      {t.navigation.compare}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          {items.length > 0 && <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2.5 bg-primary-foreground/20" />
              <p className="text-sm text-primary-foreground/90 text-center font-medium">
                {t.progressText(completedCount, items.length)}
              </p>
            </div>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {t.welcomeHeading}
          </h2>
          <p className="text-base font-medium text-muted-foreground">
            {t.welcomeSubtitle}
          </p>
        </div>
        {/* Input Area */}
        <div className="bg-card rounded-2xl shadow-md border border-border p-5 mb-6">
          <Textarea 
            placeholder={t.textareaPlaceholder} 
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
            className="min-h-[140px] resize-none bg-background border border-input focus:border-primary text-base touch-manipulation"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={shareList} disabled={items.length === 0} variant="outline" className="w-full sm:flex-1 h-12 text-base">
              <Share2 className="ml-2 h-5 w-5" />
              {t.shareButton}
            </Button>
            <Button onClick={clearAll} disabled={items.length === 0 && !inputText.trim()} variant="outline" className="w-full sm:flex-1 h-12 text-base">
              <Trash2 className="ml-2 h-5 w-5" />
              {t.clearAllButton}
            </Button>
          </div>
        </div>

        {/* Quick Start Templates - only show when no items */}
        {items.length === 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
              {t.templatesHeading}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template.items)}
                  className="px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground text-sm font-medium border border-border/50 touch-manipulation"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Item input - only show when list has items */}
        {items.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-3">
            <Input
              placeholder={t.addItemPlaceholder}
              value={singleItemInput}
              onChange={e => setSingleItemInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddSingleItem()}
              className="flex-1 h-11 text-base"
            />
            <Button onClick={handleAddSingleItem} disabled={!singleItemInput.trim()} className="h-11 px-4">
              <Plus className="h-5 w-5" />
              {t.addItemButton}
            </Button>
          </div>
        )}

        {/* List Items */}
        {items.length === 0 ? <div className="text-center py-20 px-5">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t.emptyState}
            </p>
          </div> : <div className="space-y-3">
            {items.map((item) => <div key={item.id} className="bg-card rounded-xl shadow-sm border border-border p-5 flex items-center gap-4 group hover:shadow-md touch-manipulation">
                <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id)} className="h-6 w-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all" />
                <span className={`flex-1 text-base leading-relaxed transition-all ${item.checked ? "completed-item" : "text-foreground font-medium"}`}>
                  {item.text}
                </span>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 hover:bg-destructive/10 hover:text-destructive touch-manipulation">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>)}
            {items.some(item => item.checked) && <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={clearCompleted} className="w-full sm:flex-1 h-12 font-semibold text-base touch-manipulation">
                  {t.clearCompletedButton}
                </Button>
                <Button onClick={openFinishDialog} className="w-full sm:flex-1 h-12 font-semibold bg-primary hover:bg-primary/90 text-base touch-manipulation">
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                  {t.finishButton}
                </Button>
              </div>}
          </div>}
      </div>

      {/* FAB Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
        <span className="px-4 py-1 rounded-full bg-card/90 text-card-foreground text-sm font-semibold shadow-lg border border-border text-center">
          {t.fabLabel}
        </span>
        <Button
          onClick={() => handlePaste(inputText)}
          disabled={!inputText.trim()}
          size="lg"
          aria-label={t.fabLabel}
          className="h-20 w-20 rounded-full shadow-xl bg-primary text-primary-foreground p-0 hover:bg-primary/90 disabled:opacity-50 touch-manipulation flex items-center justify-center"
        >
          <Plus className="h-10 w-10" strokeWidth={3} />
        </Button>
      </div>

      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.finishDialogTitle}</DialogTitle>
            <DialogDescription className="text-base">
              {t.finishDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                {t.amountLabel}
              </Label>
              <Input id="amount" type="number" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="h-12 text-lg" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store" className="text-base font-semibold">
                {t.storeLabel}
              </Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder={t.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map(store => <SelectItem key={store} value={store} className="text-lg">
                      {store}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedStore === otherLabel && <div className="space-y-2">
                <Label htmlFor="customStore" className="text-base font-semibold">
                  {t.customStoreLabel}
                </Label>
                <Input id="customStore" type="text" placeholder={t.customStorePlaceholder} value={customStore} onChange={e => setCustomStore(e.target.value)} className="h-12 text-lg" />
              </div>}
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">{t.summaryLabel}</p>
              <p className="text-lg font-semibold">
                {t.progressText(items.filter(item => item.checked).length, items.length)}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)} className="h-11 px-6">
              {t.cancel}
            </Button>
            <Button onClick={handleFinishShopping} className="h-11 px-6 bg-success hover:bg-success/90">
              <CheckCircle2 className="ml-2 h-4 w-4" />
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
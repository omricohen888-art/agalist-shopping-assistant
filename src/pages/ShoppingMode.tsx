import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingItem, Unit } from "@/types/shopping";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { NotebookArea } from "@/components/NotebookArea";
import { toast } from "sonner";

interface NotepadItem {
  id: string;
  text: string;
  isChecked: boolean;
  quantity?: number;
  unit?: Unit;
}

export const ShoppingMode = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [listName, setListName] = useState("");
    const [showEditMode, setShowEditMode] = useState(false);
    const [notepadItems, setNotepadItems] = useState<NotepadItem[]>([]);

    useEffect(() => {
        if (!id) {
            navigate("/");
            return;
        }

        // Load list from localStorage
        const listData = localStorage.getItem(`activeList_${id}`);
        if (listData) {
            const list = JSON.parse(listData);
            setItems(list.items || []);
            setListName(list.name || (language === 'he' ? 'רשימת קניות' : 'Shopping List'));
        } else {
            toast.error(language === 'he' ? 'הרשימה לא נמצאה' : 'List not found');
            navigate("/");
        }
    }, [id, navigate, language]);

    const toggleItem = (itemId: string) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleConvertToList = () => {
        // Convert notepad items to shopping items
        const newItems: ShoppingItem[] = notepadItems.map((notepadItem, index) => ({
            id: `${Date.now()}-${index}`,
            text: notepadItem.text,
            checked: notepadItem.isChecked,
            quantity: notepadItem.quantity || 1,
            unit: (notepadItem.unit || 'units') as Unit
        }));

        setItems(prev => [...prev, ...newItems]);
        setNotepadItems([]);
        setShowEditMode(false);
        toast.success(language === 'he' ? 'פריטים נוספו בהצלחה!' : 'Items added successfully!');
    };

    const handleQuickAdd = (name: string, quantity: number, unit: Unit) => {
        // Validate and add to notepad items
        if (!name.trim()) {
            toast.error(language === 'he' ? 'שם פריט חובה' : 'Item name required');
            return;
        }

        const newItem: NotepadItem = {
            id: `quick-add-${Date.now()}`,
            text: name.trim(),
            isChecked: false,
            quantity: quantity,
            unit: unit
        };

        setNotepadItems(prev => [...prev, newItem]);
        toast.success(language === 'he' ? 'הוסף בהצלחה!' : 'Added successfully!');
    };

    const handleFinishShopping = () => {
        if (!id) return;

        // Save to history
        const completedItems = items.filter(item => item.checked).length;
        const history = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: items,
            totalAmount: 0, // Can be filled in later
            store: "",
            completedItems,
            totalItems: items.length,
        };

        const savedHistory = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
        savedHistory.push(history);
        localStorage.setItem('shoppingHistory', JSON.stringify(savedHistory));

        // Remove active list
        localStorage.removeItem(`activeList_${id}`);

        toast.success(language === 'he' ? 'הקניות הושלמו!' : 'Shopping completed!');
        navigate("/");
    };

    const activeItems = items.filter(item => !item.checked);
    const completedItems = items.filter(item => item.checked);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24" dir={language === 'he' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/")}
                            className="h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        >
                            <ArrowRight className={`h-6 w-6 ${language === 'en' ? 'rotate-180' : ''}`} />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-foreground">
                                {language === 'he' ? '🛒 מצב קניות' : '🛒 Shopping Mode'}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground font-bold">
                                {completedItems.length} / {items.length} {language === 'he' ? 'הושלמו' : 'completed'}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowEditMode(!showEditMode)}
                        variant="outline"
                        className="text-sm font-semibold"
                    >
                        {showEditMode ? (language === 'he' ? 'סיום עריכה' : 'Done Editing') : (language === 'he' ? 'הוסף פריטים' : 'Add Items')}
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Edit Mode - Add new items */}
                {showEditMode && (
                    <div className="mb-8">
                        <NotebookArea
                            notepadItems={notepadItems}
                            setNotepadItems={setNotepadItems}
                            onQuickAdd={handleQuickAdd}
                            onConvertToList={handleConvertToList}
                            showPaste={false}
                            isVoiceRecording={false}
                            isProcessingImage={false}
                        />
                    </div>
                )}

                {/* Active Items */}
                {activeItems.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-black text-foreground mb-4">
                            {language === 'he' ? 'פריטים לקנייה' : 'Items to Buy'}
                        </h2>
                        <div className="space-y-2">
                            {activeItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <Checkbox
                                        checked={item.checked}
                                        onCheckedChange={() => toggleItem(item.id)}
                                        className="h-6 w-6"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-foreground">{item.text}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} {item.unit}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Items */}
                {completedItems.length > 0 && (
                    <div>
                        <h2 className="text-lg font-black text-muted-foreground mb-4">
                            {language === 'he' ? '✓ הושלמו' : '✓ Completed'}
                        </h2>
                        <div className="space-y-2 opacity-60">
                            {completedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl"
                                >
                                    <Checkbox
                                        checked={item.checked}
                                        onCheckedChange={() => toggleItem(item.id)}
                                        className="h-6 w-6"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-muted-foreground line-through">{item.text}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} {item.unit}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {items.length === 0 && !showEditMode && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            {language === 'he' ? 'אין פריטים ברשימה' : 'No items in list'}
                        </p>
                    </div>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t-2 border-black dark:border-slate-700 p-4">
                <div className="max-w-3xl mx-auto">
                    <Button
                        onClick={handleFinishShopping}
                        className="w-full h-14 text-lg font-black bg-primary text-primary-foreground border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <CheckCircle2 className="ml-2 h-6 w-6" />
                        {language === 'he' ? 'סיים קניות' : 'Finish Shopping'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

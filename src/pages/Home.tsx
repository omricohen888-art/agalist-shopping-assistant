import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SmartItem } from "@/types/shopping";
import { ShoppingItemRow } from "@/components/ShoppingItemRow";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Save } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";

export const Home = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [items, setItems] = useState<SmartItem[]>([]);

    const addNewItem = () => {
        const newItem: SmartItem = {
            id: Date.now().toString(),
            text: "",
            isChecked: false,
            quantity: 1,
            unit: "units",
        };
        setItems([...items, newItem]);
    };

    const updateItem = (id: string, field: keyof SmartItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSaveForLater = () => {
        if (items.length === 0) {
            toast.error(language === 'he' ? 'אין פריטים לשמור' : 'No items to save');
            return;
        }

        // Save to localStorage
        const savedLists = JSON.parse(localStorage.getItem('savedLists') || '[]');
        const newList = {
            id: Date.now().toString(),
            name: language === 'he' ? `רשימה ${savedLists.length + 1}` : `List ${savedLists.length + 1}`,
            items: items.map(item => ({
                id: item.id,
                text: item.text,
                checked: item.isChecked,
                quantity: item.quantity,
                unit: item.unit,
            })),
            createdAt: new Date().toISOString(),
        };

        savedLists.push(newList);
        localStorage.setItem('savedLists', JSON.stringify(savedLists));

        toast.success(language === 'he' ? 'הרשימה נשמרה בהצלחה' : 'List saved successfully');
        setItems([]);
    };

    const handleGoShopping = () => {
        if (items.length === 0) {
            toast.error(language === 'he' ? 'הוסף פריטים לפני שתצא לקניות' : 'Add items before shopping');
            return;
        }

        // Save current list to active shopping
        const listId = Date.now().toString();
        const shoppingList = {
            id: listId,
            items: items.map(item => ({
                id: item.id,
                text: item.text,
                checked: item.isChecked,
                quantity: item.quantity,
                unit: item.unit,
            })),
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(`activeList_${listId}`, JSON.stringify(shoppingList));
        navigate(`/list/${listId}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-foreground mb-2">
                        {language === 'he' ? '📝 תכנון קניות' : '📝 Shopping Planner'}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        {language === 'he'
                            ? 'תכנן את הרשימה שלך לפני שאתה יוצא לקניות'
                            : 'Plan your list before you go shopping'}
                    </p>
                </div>

                {/* Yellow Legal Pad */}
                <div className="bg-[#fef9c3] dark:bg-yellow-900/20 rounded-lg border-2 border-black dark:border-yellow-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                    <div className="space-y-1">
                        {items.map((item) => (
                            <ShoppingItemRow
                                key={item.id}
                                item={item}
                                onUpdate={(field, value) => updateItem(item.id, field, value)}
                                onDelete={deleteItem}
                            />
                        ))}

                        {items.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-medium">
                                    {language === 'he'
                                        ? 'לחץ על הכפתור למטה להוספת פריטים'
                                        : 'Click the button below to add items'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Add Item Button */}
                    <Button
                        onClick={addNewItem}
                        variant="outline"
                        className="mt-4 w-full border-2 border-dashed border-gray-400 dark:border-gray-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                        <Plus className="ml-2 h-4 w-4" />
                        {language === 'he' ? 'הוסף פריט' : 'Add Item'}
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        onClick={handleSaveForLater}
                        variant="outline"
                        className="flex-1 h-12 font-bold border-2 border-black dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        disabled={items.length === 0}
                    >
                        <Save className="ml-2 h-5 w-5" />
                        {language === 'he' ? 'שמור לאחר כך' : 'Save for Later'}
                    </Button>

                    <Button
                        onClick={handleGoShopping}
                        className="flex-1 h-12 font-bold bg-primary text-primary-foreground border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        disabled={items.length === 0}
                    >
                        <Rocket className="ml-2 h-5 w-5" />
                        {language === 'he' ? 'צא לקניות 🚀' : 'Go Shopping 🚀'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { SavedListCard } from "@/components/SavedListCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Plus, Book, Trash2, Check } from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translations";
import { toast } from "sonner";
import { QuantityStepper } from "@/components/ShoppingListItem";

const MyNotebook = () => {
    const navigate = useNavigate();
    const { language } = useGlobalLanguage();
    const t = translations[language];
    const direction = language === 'he' ? 'rtl' : 'ltr';
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [editingList, setEditingList] = useState<SavedList | null>(null);
    const [editListName, setEditListName] = useState('');
    const [editListItems, setEditListItems] = useState<ShoppingItem[]>([]);
    const [modalItemName, setModalItemName] = useState('');
    const [modalQuantity, setModalQuantity] = useState('1');
    const [modalUnit, setModalUnit] = useState<Unit>('units');
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setSavedLists(getSavedLists());
    }, []);

    const handleDeleteList = (id: string) => {
        if (window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק רשימה זו?' : 'Are you sure you want to delete this list?')) {
            deleteSavedList(id);
            setSavedLists(getSavedLists());
        }
    };

    const handleToggleItemInList = (listId: string, itemId: string) => {
        const list = savedLists.find(l => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );

        const updatedList = { ...list, items: updatedItems };
        updateSavedList(updatedList);
        setSavedLists(getSavedLists());
    };

    const handleLoadList = (list: SavedList) => {
        navigate('/', { state: { loadList: list } });
    };

    const handleEditList = (list: SavedList) => {
        setEditingList(list);
        setEditListName(list.name);
        setEditListItems([...list.items]);
    };

    const handleQuickShop = (list: SavedList) => {
        navigate('/', { state: { quickShop: list } });
    };

    const handleDeleteEditItem = (itemId: string) => {
        setEditListItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleUpdateEditItemQuantity = (itemId: string, newQuantity: number) => {
        setEditListItems(prev => 
            prev.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleSaveEditedList = () => {
        if (!editingList) return;
        const updatedList: SavedList = {
            ...editingList,
            name: editListName,
            items: editListItems
        };
        if (updateSavedList(updatedList)) {
            setSavedLists(getSavedLists());
            toast.success(language === 'he' ? 'הרשימה עודכנה בהצלחה' : 'List updated successfully');
            setEditingList(null);
            setModalItemName('');
            setModalQuantity('1');
            setModalUnit('units');
        } else {
            toast.error(language === 'he' ? 'שגיאה בעדכון הרשימה' : 'Error updating list');
        }
    };

    const handleAddEditItem = () => {
        if (!modalItemName.trim()) return;
        const newItem: ShoppingItem = {
            id: `${Date.now()}`,
            text: modalItemName.trim(),
            checked: false,
            quantity: parseFloat(modalQuantity) || 1,
            unit: modalUnit
        };
        setEditListItems(prev => [...prev, newItem]);
        setNewItemIds(prev => new Set([...prev, newItem.id]));
        
        // Remove animation class after animation completes
        setTimeout(() => {
            setNewItemIds(prev => {
                const updated = new Set(prev);
                updated.delete(newItem.id);
                return updated;
            });
        }, 600);
        
        setModalItemName('');
        setModalQuantity('1');
        setModalUnit('units');
    };

    return (
        <div className="min-h-screen bg-background pb-20" dir={direction}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full h-10 w-10">
                            {direction === 'rtl' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Book className="h-6 w-6 text-primary" />
                            <h1 className="text-xl sm:text-2xl font-black text-foreground">{t.myListsTitle}</h1>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 px-6 rounded-lg border-2 border-black dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="mr-2 h-5 w-5" />
                        {language === 'he' ? 'רשימה חדשה' : 'New List'}
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {/* Urban Decorations */}
                <div className="mb-8 text-center">
                    <p className="text-muted-foreground font-medium text-lg">
                        {language === 'he'
                            ? 'כל הרשימות שלך במקום אחד. מסודרות, שמורות ומוכנות לקנייה הבאה.'
                            : 'All your lists in one place. Organized, saved, and ready for your next shop.'}
                    </p>
                </div>

                {savedLists.length === 0 ? (
                    <div className="text-center py-12 sm:py-24">
                        <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 inline-block max-w-md mx-auto w-full">
                            <Book className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                                {language === 'he' ? 'הפנקס שלך ריק' : 'Your notebook is empty'}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm sm:text-base font-medium">
                                {language === 'he'
                                    ? 'עדיין לא שמרת רשימות. צור רשימה חדשה ושמור אותה כדי לראות אותה כאן.'
                                    : 'You haven\'t saved any lists yet. Create a new list and save it to see it here.'}
                            </p>
                            <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 sm:h-11 px-6 sm:px-8 border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all w-full sm:w-auto">
                                {language === 'he' ? 'צור רשימה ראשונה' : 'Create First List'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                        {savedLists.map((list, index) => (
                            <SavedListCard
                                key={list.id}
                                list={list}
                                index={index}
                                language={language}
                                t={t}
                                onLoad={handleLoadList}
                                onEdit={handleEditList}
                                onDelete={handleDeleteList}
                                onToggleItem={handleToggleItemInList}
                                onQuickShop={handleQuickShop}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit List Modal */}
            <Dialog open={!!editingList} onOpenChange={(open) => !open && setEditingList(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{language === 'he' ? 'עריכת רשימה' : 'Edit List'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* List Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="editListName" className="font-bold">
                                {language === 'he' ? 'שם הרשימה' : 'List Name'}
                            </Label>
                            <Input
                                id="editListName"
                                value={editListName}
                                onChange={(e) => setEditListName(e.target.value)}
                                placeholder={language === 'he' ? 'שם הרשימה' : 'List name'}
                                className="h-10 text-base"
                            />
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            <Label className="font-bold">
                                {language === 'he' ? 'פריטים' : 'Items'} ({editListItems.length})
                            </Label>
                            {editListItems.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">
                                    {language === 'he' ? 'אין פריטים ברשימה' : 'No items in list'}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {editListItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 transition-all duration-500"
                                            style={
                                                newItemIds.has(item.id) 
                                                    ? {
                                                        animation: 'slideInFromBottom 0.6s ease-out forwards',
                                                    }
                                                    : {}
                                            }
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.text}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <QuantityStepper 
                                                    value={item.quantity}
                                                    onChange={(newQty) => handleUpdateEditItemQuantity(item.id, newQty)}
                                                    unit={item.unit}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteEditItem(item.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Item with Smart Quantity Controls */}
                        <div className="space-y-2 border-t pt-4">
                            <Label className="font-bold">
                                {language === 'he' ? 'הוספת פריט' : 'Add Item'}
                            </Label>

                            {/* Item Name Input */}
                            <Input
                                value={modalItemName}
                                onChange={(e) => setModalItemName(e.target.value)}
                                placeholder={language === 'he' ? 'שם הפריט...' : 'Item name...'}
                                className="h-10 text-base"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddEditItem();
                                    }
                                }}
                            />

                            {/* Smart Quantity Controls Row */}
                            <div className="flex gap-2 items-center bg-gray-100 dark:bg-slate-700 p-3 rounded-lg flex-wrap">
                                {/* Quantity Stepper */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            const qty = parseFloat(modalQuantity) || 1;
                                            const step = modalUnit === 'units' ? 1 : 0.5;
                                            setModalQuantity(Math.max(0.1, qty - step).toString());
                                        }}
                                        className="h-8 w-8 rounded-md bg-white dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-gray-900 dark:text-white transition-colors"
                                    >
                                        −
                                    </button>

                                    <input
                                        type={modalUnit === 'units' ? 'text' : 'number'}
                                        value={modalQuantity}
                                        onChange={(e) => {
                                            if (modalUnit !== 'units') {
                                                setModalQuantity(e.target.value);
                                            }
                                        }}
                                        readOnly={modalUnit === 'units'}
                                        step={modalUnit === 'units' ? '1' : '0.5'}
                                        min="0.1"
                                        className="w-16 h-8 text-center font-bold rounded-md bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                    />

                                    <button
                                        onClick={() => {
                                            const qty = parseFloat(modalQuantity) || 1;
                                            const step = modalUnit === 'units' ? 1 : 0.5;
                                            setModalQuantity((qty + step).toString());
                                        }}
                                        className="h-8 w-8 rounded-md bg-white dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-gray-900 dark:text-white transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Unit Selector */}
                                <Select value={modalUnit} onValueChange={(value) => setModalUnit(value as Unit)}>
                                    <SelectTrigger className="w-32 h-8 text-sm bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map(unit => (
                                            <SelectItem key={unit.value} value={unit.value}>
                                                {language === 'he' ? unit.labelHe : unit.labelEn}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Add Button */}
                                <Button
                                    onClick={handleAddEditItem}
                                    className="ml-auto bg-primary hover:bg-primary/90 h-8 px-3"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setEditingList(null)}
                        >
                            {language === 'he' ? 'ביטול' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSaveEditedList}
                            className="bg-success hover:bg-success/90"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyNotebook;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, ShoppingCart, X, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";

interface SavedListCardProps {
    list: SavedList;
    index: number;
    language: 'he' | 'en';
    t: any;
    onLoad: (list: SavedList) => void;
    onDelete: (id: string) => void;
    onToggleItem: (listId: string, itemId: string) => void;
    onUpdateItem?: (listId: string, item: ShoppingItem) => void;
    onGoShopping?: (list: SavedList) => void;
}

export const SavedListCard: React.FC<SavedListCardProps> = ({
    list,
    index,
    language,
    t,
    onLoad,
    onDelete,
    onToggleItem,
    onUpdateItem,
    onGoShopping
}) => {
    const { language: userLanguage } = useGlobalLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<ShoppingItem[]>(list.items);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<number>(0);
    const [editingUnit, setEditingUnit] = useState<Unit>('units');
    const direction = userLanguage === 'he' ? 'rtl' : 'ltr';

    // Indicator dot colors
    const indicatorColors = [
        'bg-primary',
        'bg-success',
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
    ];
    const indicatorColor = indicatorColors[index % indicatorColors.length];

    const handleStartEditItem = (item: ShoppingItem) => {
        setEditingItemId(item.id);
        setEditingQuantity(item.quantity || 1);
        setEditingUnit(item.unit || 'units');
    };

    const handleSaveItemEdit = (itemId: string) => {
        const updatedItems = items.map(item =>
            item.id === itemId
                ? { ...item, quantity: editingQuantity, unit: editingUnit }
                : item
        );
        setItems(updatedItems);
        
        if (onUpdateItem) {
            const updatedItem = updatedItems.find(item => item.id === itemId);
            if (updatedItem) {
                onUpdateItem(list.id, updatedItem);
            }
        }
        
        setEditingItemId(null);
    };

    const handleCancelEditItem = () => {
        setEditingItemId(null);
    };

    const handleToggleItem = (itemId: string) => {
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        setItems(updatedItems);
        onToggleItem(list.id, itemId);
    };

    const getDisplayQuantityUnit = (item: ShoppingItem) => {
        if (item.quantity <= 1 && item.unit === 'units') {
            return '';
        }
        const unitLabel = UNITS.find(u => u.value === item.unit);
        const unitText = language === 'he' ? unitLabel?.labelHe : unitLabel?.labelEn;
        return `${item.quantity} ${unitText}`;
    };

    const visibleItems = isExpanded ? items : items.slice(0, 5);
    const hasMoreItems = items.length > 5;

    return (
        <div
            className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group relative flex flex-col h-auto min-h-[260px] overflow-hidden"
            dir={direction}
        >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-border/30 gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${indicatorColor} flex-shrink-0`} />
                    <h4 className="font-semibold text-base sm:text-lg text-foreground truncate flex-1">{list.name}</h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onLoad(list); }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
                        title={language === 'he' ? 'ערוך רשימה' : 'Edit List'}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        title={language === 'he' ? 'מחק רשימה' : 'Delete List'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Preview Items */}
            <div className={`flex-1 overflow-hidden relative ${isExpanded ? 'max-h-96 overflow-y-auto' : ''}`}>
                <ul className="space-y-1.5">
                    {visibleItems.map((item) => (
                        <li
                            key={item.id}
                            className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-xl transition-all group/item ${item.checked ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                        >
                            {/* Checkbox */}
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => handleToggleItem(item.id)}
                                className="h-4 w-4 border-2 border-border data-[state=checked]:bg-success data-[state=checked]:border-success rounded transition-all flex-shrink-0 cursor-pointer"
                            />

                            {/* Item Text */}
                            <span className={`flex-1 font-medium text-sm leading-snug ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {item.text}
                            </span>

                            {/* Quantity & Unit (Editable) */}
                            {editingItemId === item.id ? (
                                <div className="flex items-center gap-1 flex-shrink-0 bg-card rounded-xl p-2 border border-primary/50 shadow-sm">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step={editingUnit === 'units' ? '1' : '0.1'}
                                        value={editingQuantity}
                                        onChange={(e) => {
                                            let val = parseFloat(e.target.value);
                                            if (editingUnit === 'units' && !isNaN(val)) {
                                                val = Math.max(1, Math.round(val));
                                            } else if (isNaN(val)) {
                                                val = 1;
                                            }
                                            setEditingQuantity(val);
                                        }}
                                        className="w-12 text-center text-xs rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors font-semibold"
                                        autoFocus
                                    />
                                    <Select
                                        value={editingUnit}
                                        onValueChange={(val: Unit) => setEditingUnit(val)}
                                    >
                                        <SelectTrigger className="h-8 w-16 px-1.5 text-xs border border-border rounded-lg justify-center [&>span]:text-center [&>svg]:hidden bg-background text-foreground font-semibold hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20">
                                            <span className="truncate">
                                                {UNITS.find(u => u.value === editingUnit)?.[language === 'he' ? 'labelHe' : 'labelEn']}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="border border-border rounded-xl shadow-lg">
                                            {UNITS.map(u => (
                                                <SelectItem key={u.value} value={u.value}>
                                                    {language === 'he' ? u.labelHe : u.labelEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleSaveItemEdit(item.id)}
                                        className="h-7 w-7 p-0 text-success hover:text-success/80 hover:bg-success/10 rounded-lg font-bold text-lg flex-shrink-0"
                                    >
                                        ✓
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleCancelEditItem}
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {getDisplayQuantityUnit(item) && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors flex-shrink-0 font-medium"
                                            title={language === 'he' ? 'ערוך כמות' : 'Edit quantity'}
                                        >
                                            {getDisplayQuantityUnit(item)}
                                        </button>
                                    )}
                                    {(!item.quantity || item.quantity <= 1) && item.unit === 'units' && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-xs text-muted-foreground px-2 py-1 rounded-lg cursor-pointer hover:bg-muted transition-colors flex-shrink-0 font-medium"
                                            title={language === 'he' ? 'הוסף כמות' : 'Add quantity'}
                                        >
                                            +
                                        </button>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Expand/Collapse Button */}
            {hasMoreItems && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted font-medium"
                    >
                        {isExpanded ? (
                            <>
                                <span>{language === 'he' ? 'הסתר' : 'Hide'}</span>
                                <ChevronDown className="h-4 w-4 rotate-180" />
                            </>
                        ) : (
                            <>
                                <span>{language === 'he' ? `עוד ${items.length - 5}` : `${items.length - 5} more`}</span>
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                    {new Date(list.createdAt || new Date().toISOString()).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
                {onGoShopping && (
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onGoShopping(list); }}
                        className="h-8 px-4 bg-success hover:bg-success/90 text-success-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                        title={language === 'he' ? 'צא לקנייה' : 'Go Shopping'}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {language === 'he' ? 'קנייה' : 'Shop'}
                    </Button>
                )}
            </div>
        </div>
    );
};
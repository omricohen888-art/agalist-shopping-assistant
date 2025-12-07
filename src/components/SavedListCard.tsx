import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, ShoppingCart, X, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useTheme } from "next-themes";
import { useGlobalLanguage } from "@/context/LanguageContext";

interface SavedListCardProps {
    list: SavedList;
    index: number;
    language: 'he' | 'en';
    t: any;
    onLoad: (list: SavedList) => void;
    onEdit?: (list: SavedList) => void;
    onDelete: (id: string) => void;
    onToggleItem: (listId: string, itemId: string) => void;
    onUpdateItem?: (listId: string, item: ShoppingItem) => void;
    onQuickShop?: (list: SavedList) => void;
}

export const SavedListCard: React.FC<SavedListCardProps> = ({
    list,
    index,
    language,
    t,
    onLoad,
    onEdit,
    onDelete,
    onToggleItem,
    onUpdateItem,
    onQuickShop
}) => {
    const { theme } = useTheme();
    const { language: userLanguage } = useGlobalLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<ShoppingItem[]>(list.items);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<number>(0);
    const [editingUnit, setEditingUnit] = useState<Unit>('units');
    const direction = userLanguage === 'he' ? 'rtl' : 'ltr';

    // Random rotation based on index for stable rendering
    const rotation = index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0';

    // Modern multi-color palette
    const cardColors = [
        'bg-[#FEFCE8]', // Yellow
        'bg-[#FFF7ED]', // Orange/Peach
        'bg-[#F0FDF4]', // Green/Mint
        'bg-[#FAF5FF]', // Purple/Lavender
        'bg-[#F0F9FF]', // Blue/Sky
        'bg-[#FFF1F2]', // Rose
    ];
    const colorClass = cardColors[index % cardColors.length];

    // Indicator dot colors
    const indicatorColors = [
        'bg-yellow-400', // Yellow
        'bg-emerald-400', // Green
        'bg-blue-400', // Blue
        'bg-purple-400', // Purple
        'bg-pink-400', // Pink
        'bg-orange-400', // Orange
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
            className={`${colorClass} dark:bg-slate-800 border-2 border-black dark:border-slate-600 rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-3px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative flex flex-col h-[450px] overflow-hidden ${rotation}`}
            dir={direction}
            style={theme !== 'dark' ? {
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
            } : {}}
        >
            {/* Spiral Binding Effect */}
            {theme !== 'dark' && (
                <div className={`absolute top-0 bottom-4 ${direction === 'rtl' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="relative h-3 w-full">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#1a1a1a] rounded-full shadow-inner" />
                            <div className={`absolute top-1/2 ${direction === 'rtl' ? 'left-1/2' : 'right-1/2'} w-5 h-1 bg-zinc-400 rounded-full transform ${direction === 'rtl' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                        </div>
                    ))}
                </div>
            )}

            {/* Card Header - Compact */}
            <div className="flex justify-between items-start mb-3 sm:mb-4 border-b-2 border-black/10 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight truncate flex-1">{list.name}</h4>
                    <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${indicatorColor} flex-shrink-0`} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-0"
                        title={language === 'he' ? 'מחק רשימה' : 'Delete List'}
                    >
                        <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </Button>
                </div>
            </div>

            {/* Preview Items - Scrollable */}
            <div className={`flex-1 overflow-hidden relative ${isExpanded ? 'max-h-96 overflow-y-auto' : ''}`}>
                <ul className="space-y-2 sm:space-y-2.5">
                    {visibleItems.map((item) => (
                        <li
                            key={item.id}
                            className={`flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors group/item ${item.checked ? 'bg-gray-100/60 dark:bg-slate-700/40' : 'hover:bg-black/5 dark:hover:bg-slate-700/50 bg-white/40 dark:bg-white/5'}`}
                        >
                            {/* Checkbox */}
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => handleToggleItem(item.id)}
                                className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-400 dark:border-slate-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-sm transition-all flex-shrink-0 cursor-pointer"
                            />

                            {/* Item Text */}
                            <span className={`flex-1 font-medium text-sm sm:text-base leading-snug ${item.checked ? 'line-through text-gray-500 dark:text-slate-500 decoration-1 sm:decoration-2' : 'text-gray-900 dark:text-slate-200'}`}>
                                {item.text}
                            </span>

                            {/* Quantity & Unit (Editable) */}
                            {editingItemId === item.id ? (
                                <div className="flex items-center gap-1 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg p-2 border-2 border-yellow-400 shadow-sm">
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
                                        className="w-12 sm:w-14 text-center text-xs sm:text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-black dark:text-slate-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none transition-colors font-semibold"
                                        autoFocus
                                    />
                                    <Select
                                        value={editingUnit}
                                        onValueChange={(val: Unit) => setEditingUnit(val)}
                                    >
                                        <SelectTrigger className="h-8 sm:h-9 w-16 sm:w-20 px-1.5 text-xs sm:text-sm border-2 border-gray-300 dark:border-slate-600 rounded-lg justify-center [&>span]:text-center [&>svg]:hidden bg-white dark:bg-slate-900 text-black dark:text-slate-100 font-semibold hover:border-yellow-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50">
                                            <span className="truncate">
                                                {UNITS.find(u => u.value === editingUnit)?.[language === 'he' ? 'labelHe' : 'labelEn']}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-lg">
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
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg font-bold text-lg flex-shrink-0"
                                    >
                                        ✓
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleCancelEditItem}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {getDisplayQuantityUnit(item) && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex-shrink-0 group-hover/item:opacity-100 opacity-85 font-semibold hover:shadow-md"
                                            title={language === 'he' ? 'ערוך כמות' : 'Edit quantity'}
                                        >
                                            {getDisplayQuantityUnit(item)}
                                        </button>
                                    )}
                                    {(!item.quantity || item.quantity <= 1) && item.unit === 'units' && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-xs text-gray-400 dark:text-slate-500 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0 font-semibold hover:text-gray-600"
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

                {/* Fade out effect at bottom for long lists */}
                {isExpanded && items.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/90 dark:from-slate-800/90 to-transparent pointer-events-none" />
                )}
            </div>

            {/* Expand/Collapse Button */}
            {hasMoreItems && (
                <div className="flex justify-center pt-2.5 sm:pt-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-slate-700/50 font-semibold"
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

            {/* Footer - Action Bar */}
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t-2 border-black/5 dark:border-slate-700/30">
                <div className="flex items-center justify-between gap-2">
                    {/* Date */}
                    <span className="text-[8px] sm:text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
                        {new Date(list.createdAt || new Date().toISOString()).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        {/* Edit Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) {
                                    onEdit(list);
                                } else {
                                    onLoad(list);
                                }
                            }}
                            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            title={language === 'he' ? 'ערוך רשימה' : 'Edit List'}
                        >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{language === 'he' ? 'עריכה' : 'Edit'}</span>
                        </Button>

                        {/* Shop Now Button */}
                        {onQuickShop && (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickShop(list);
                                }}
                                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 dark:text-gray-900 shadow-md hover:shadow-lg transition-all active:scale-95"
                                title={language === 'he' ? 'קנייה עכשיו' : 'Shop Now'}
                            >
                                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{language === 'he' ? 'קנייה' : 'Shop'}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, X, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";

interface ShoppingListPreviewProps {
    list: SavedList;
    index: number;
    t: any;
    onLoad: (list: SavedList) => void;
    onDelete: (id: string) => void;
    onToggleItem: (listId: string, itemId: string) => void;
    onUpdateItem?: (listId: string, item: ShoppingItem) => void;
    onGoShopping?: (list: SavedList) => void;
    isPreviewMode?: boolean;
}

export const ShoppingListPreview: React.FC<ShoppingListPreviewProps> = ({
    list,
    index,
    t,
    onLoad,
    onDelete,
    onToggleItem,
    onUpdateItem,
    onGoShopping,
    isPreviewMode = true
}) => {
    const { language } = useGlobalLanguage();
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<ShoppingItem[]>(list.items);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<number>(0);
    const [editingUnit, setEditingUnit] = useState<Unit>('units');
    const contentRef = useRef<HTMLDivElement>(null);
    const direction = language === 'he' ? 'rtl' : 'ltr';

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

    const handleDeleteItem = (itemId: string) => {
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
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
            className={`${colorClass} dark:bg-slate-800 border-2 border-black dark:border-slate-600 rounded-xl p-3 sm:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative flex flex-col h-auto min-h-[200px] overflow-hidden ${rotation}`}
            dir={direction}
            style={theme !== 'dark' ? {
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
            } : {}}
        >
            {/* Spiral Binding Effect */}
            {theme !== 'dark' && (
                <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="relative h-3 w-full">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#1a1a1a] rounded-full shadow-inner" />
                            <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-5 h-1 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                        </div>
                    ))}
                </div>
            )}

            {/* Card Header - Compact */}
            <div className="flex justify-between items-start mb-2 sm:mb-3 border-b-2 border-black/10 dark:border-slate-700/50 pb-1.5 sm:pb-2 gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight flex-1 break-words line-clamp-2" title={list.name}>{list.name}</h4>
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${indicatorColor} flex-shrink-0`} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onLoad(list); }}
                        className="h-6 w-6 sm:h-7 sm:w-7 text-gray-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-slate-700 rounded-full p-0"
                        title={language === 'he' ? 'ערוך רשימה' : 'Edit List'}
                    >
                        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                        className="h-6 w-6 sm:h-7 sm:w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-0"
                        title={language === 'he' ? 'מחק רשימה' : 'Delete List'}
                    >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Preview Items - Scrollable in preview mode */}
            <div className={`flex-1 overflow-hidden relative ${isPreviewMode && isExpanded ? 'max-h-96 overflow-y-auto' : ''}`} ref={contentRef}>
                <ul className="space-y-0.5 sm:space-y-1">
                    {visibleItems.map((item) => (
                        <li
                            key={item.id}
                            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1.5 sm:px-2 py-1 sm:py-1.5 rounded transition-colors group/item ${item.checked ? 'bg-gray-100/50 dark:bg-slate-700/30' : 'hover:bg-black/5 dark:hover:bg-slate-700/50'}`}
                        >
                            {/* Checkbox */}
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => handleToggleItem(item.id)}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-gray-400 dark:border-slate-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-sm transition-all flex-shrink-0"
                            />

                            {/* Item Text */}
                            <span className={`flex-1 font-medium ${item.checked ? 'line-through text-gray-400 dark:text-slate-500 decoration-1 sm:decoration-2' : 'text-gray-900 dark:text-slate-200'}`}>
                                {item.text}
                            </span>

                            {/* Quantity & Unit (Editable in preview mode) */}
                            {editingItemId === item.id ? (
                                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
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
                                        className="w-8 h-6 text-center text-[10px] sm:text-xs rounded border border-gray-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-black dark:text-slate-100 focus:border-yellow-400 focus:outline-none transition-colors"
                                        autoFocus
                                    />
                                    <Select
                                        value={editingUnit}
                                        onValueChange={(val: Unit) => setEditingUnit(val)}
                                    >
                                        <SelectTrigger className="h-6 w-12 sm:w-14 px-0 sm:px-1 text-[8px] sm:text-[10px] border border-gray-400 dark:border-slate-600 rounded justify-center [&>span]:text-center [&>svg]:hidden bg-white dark:bg-slate-900 text-black dark:text-slate-100">
                                            <span className="truncate">
                                                {UNITS.find(u => u.value === editingUnit)?.[language === 'he' ? 'labelHe' : 'labelEn']}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent className="border border-gray-400 dark:border-slate-600">
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
                                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                                    >
                                        ✓
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleCancelEditItem}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {getDisplayQuantityUnit(item) && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-[9px] sm:text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0 group-hover/item:opacity-100 opacity-70"
                                            title={language === 'he' ? 'ערוך כמות' : 'Edit quantity'}
                                        >
                                            {getDisplayQuantityUnit(item)}
                                        </button>
                                    )}
                                    {(!item.quantity || item.quantity <= 1) && item.unit === 'units' && (
                                        <button
                                            onClick={() => handleStartEditItem(item)}
                                            className="text-[9px] text-gray-400 dark:text-slate-500 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
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
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 dark:from-slate-800/90 to-transparent pointer-events-none" />
                )}
            </div>

            {/* Expand/Collapse Button for Preview Mode */}
            {isPreviewMode && hasMoreItems && (
                <div className="flex justify-center pt-1.5 sm:pt-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-slate-700/50"
                    >
                        {isExpanded ? (
                            <>
                                <span>{language === 'he' ? 'הסתר' : 'Hide'}</span>
                                <ChevronDown className="h-3 w-3 rotate-180" />
                            </>
                        ) : (
                            <>
                                <span>{language === 'he' ? `...עוד ${items.length - 5}` : `...${items.length - 5} more`}</span>
                                <ChevronDown className="h-3 w-3" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Footer - Date and Action Button */}
            <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-black/5 dark:border-slate-700/30 flex justify-between items-center gap-1.5 sm:gap-2">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
                    {new Date(list.createdAt || new Date().toISOString()).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
                {onGoShopping && (
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onGoShopping(list); }}
                        className="h-5 sm:h-6 px-2 sm:px-3 bg-green-500 hover:bg-green-600 text-white font-bold text-[9px] sm:text-xs rounded flex items-center gap-0.5"
                        title={language === 'he' ? 'צא לקנייה' : 'Go Shopping'}
                    >
                        🛒 {language === 'he' ? 'קנייה' : 'Shop'}
                    </Button>
                )}
            </div>
        </div>
    );
};

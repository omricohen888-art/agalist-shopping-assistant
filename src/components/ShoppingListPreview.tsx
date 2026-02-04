import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Trash2, Pencil, X, ChevronDown, ShoppingCart, Copy, Play, CheckCircle2, RefreshCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { useGlobalLanguage } from "@/context/LanguageContext";

interface ShoppingListPreviewProps {
    list: SavedList;
    index: number;
    t: any;
    onLoad: (list: SavedList) => void;
    onDelete: (id: string) => void;
    onToggleItem: (listId: string, itemId: string) => void;
    onUpdateItem?: (listId: string, item: ShoppingItem) => void;
    onGoShopping?: (list: SavedList) => void;
    onDuplicate?: (list: SavedList) => void;
    isPreviewMode?: boolean;
    variant?: 'default' | 'in-progress' | 'completed';
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
    onDuplicate,
    isPreviewMode = true,
    variant = 'default'
}) => {
    const { language } = useGlobalLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<ShoppingItem[]>(list.items);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingQuantity, setEditingQuantity] = useState<number>(0);
    const [editingUnit, setEditingUnit] = useState<Unit>('units');
    const contentRef = useRef<HTMLDivElement>(null);
    const direction = language === 'he' ? 'rtl' : 'ltr';

    // Calculate progress
    const completedCount = items.filter(item => item.checked).length;
    const totalCount = items.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

    // Format duration
    const formatDuration = (seconds?: number): string => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins >= 60) {
            const hrs = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const handleCopyList = async () => {
        const checkedItems = items.filter(item => item.checked);
        const uncheckedItems = items.filter(item => !item.checked);

        const formatItem = (item: ShoppingItem) => {
            const checkbox = item.checked ? '✓' : '☐';
            const quantityUnit = getDisplayQuantityUnit(item);
            const quantityText = quantityUnit ? ` (${quantityUnit})` : '';
            return `${checkbox} ${item.text}${quantityText}`;
        };

        let listText = '';
        
        if (uncheckedItems.length > 0) {
            listText += uncheckedItems.map(formatItem).join('\n');
        }
        
        if (checkedItems.length > 0) {
            if (uncheckedItems.length > 0) {
                listText += '\n\n' + (language === 'he' ? '── הושלמו ──' : '── Done ──') + '\n';
            }
            listText += checkedItems.map(formatItem).join('\n');
        }

        const header = `📋 ${list.name}`;
        const divider = '─'.repeat(20);
        const summary = language === 'he' 
            ? `\n\n📊 סה"כ: ${items.length} פריטים | ✓ ${checkedItems.length} הושלמו`
            : `\n\n📊 Total: ${items.length} items | ✓ ${checkedItems.length} done`;

        const fullText = `${header}\n${divider}\n${listText}${summary}`;

        try {
            await navigator.clipboard.writeText(fullText);
            toast.success(language === 'he' ? 'הרשימה הועתקה ללוח' : 'List copied to clipboard');
        } catch (err) {
            toast.error(language === 'he' ? 'לא ניתן להעתיק' : 'Could not copy');
        }
    };

    const visibleItems = isExpanded ? items : items.slice(0, 5);
    const hasMoreItems = items.length > 5;

    return (
        <div
            className="bg-card border-2 border-foreground/50 dark:border-foreground/40 rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group relative flex flex-col h-auto min-h-[220px] sm:min-h-[260px] overflow-hidden"
            dir={direction}
        >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-border/30 gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${indicatorColor} flex-shrink-0`} />
                    <h4 className="font-semibold text-base sm:text-lg text-foreground flex-1 break-words line-clamp-2" title={list.name}>{list.name}</h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleCopyList(); }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
                        title={language === 'he' ? 'העתק רשימה' : 'Copy List'}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
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

            {/* Progress Bar - Only show when in progress */}
            {variant === 'in-progress' && totalCount > 0 && (
                <div className="mb-3 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">
                            {language === 'he' ? 'התקדמות' : 'Progress'}
                        </span>
                        <span className="font-semibold text-primary">
                            {completedCount}/{totalCount} ({progressPercent}%)
                        </span>
                    </div>
                    <Progress 
                        value={progressPercent} 
                        className="h-2 bg-muted"
                    />
                </div>
            )}

            {/* Preview Items */}
            <div className={`flex-1 overflow-hidden relative ${isPreviewMode && isExpanded ? 'max-h-96 overflow-y-auto' : ''}`} ref={contentRef}>
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

                            {/* Quantity & Unit (Editable in preview mode) */}
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
            {isPreviewMode && hasMoreItems && (
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
            <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">
                        {new Date(list.createdAt || new Date().toISOString()).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                    {list.shoppingDuration && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {formatDuration(list.shoppingDuration)}
                        </span>
                    )}
                </div>
                
                {/* Shopping Status Badge + Action - Based on Variant */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {variant === 'completed' ? (
                        <>
                            <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{language === 'he' ? 'הושלמה' : 'Done'}</span>
                            </div>
                            {onDuplicate && (
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(list); }}
                                    className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    <span>{language === 'he' ? 'קנה שוב' : 'Shop Again'}</span>
                                </Button>
                            )}
                        </>
                    ) : variant === 'in-progress' ? (
                        <>
                            <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-xs font-semibold">
                                <Play className="h-3.5 w-3.5" />
                                <span>{language === 'he' ? 'בתהליך' : 'In Progress'}</span>
                            </div>
                            {onGoShopping && (
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onGoShopping({ ...list, items }); }}
                                    className="h-8 px-3 bg-warning hover:bg-warning/90 text-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm border border-foreground/20"
                                >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>{language === 'he' ? 'המשך קנייה' : 'Continue'}</span>
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>{language === 'he' ? 'מוכנה' : 'Ready'}</span>
                            </div>
                            {onGoShopping && (
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onGoShopping({ ...list, items }); }}
                                    className="h-8 px-3 bg-success hover:bg-success/90 text-success-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                                    title={language === 'he' ? 'צא לקנייה' : 'Go Shopping'}
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    {language === 'he' ? 'צא לקנייה' : 'Go Shop'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
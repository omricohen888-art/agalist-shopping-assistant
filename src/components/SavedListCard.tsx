import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedList } from "@/types/shopping";
import { useTheme } from "next-themes";

interface SavedListCardProps {
    list: SavedList;
    index: number;
    language: 'he' | 'en';
    t: any;
    onLoad: (list: SavedList) => void;
    onDelete: (id: string) => void;
    onToggleItem: (listId: string, itemId: string) => void;
}

export const SavedListCard: React.FC<SavedListCardProps> = ({
    list,
    index,
    language,
    t,
    onLoad,
    onDelete,
    onToggleItem
}) => {
    const { theme } = useTheme();

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

    // Indicator dot colors - bright and visible in both light and dark modes
    const indicatorColors = [
        'bg-yellow-400', // Yellow
        'bg-emerald-400', // Green
        'bg-blue-400', // Blue
        'bg-purple-400', // Purple
        'bg-pink-400', // Pink
        'bg-orange-400', // Orange
    ];
    const indicatorColor = indicatorColors[index % indicatorColors.length];

    // Shadow colors for glow effect
    const shadowColors = [
        'shadow-yellow-400/60', // Yellow glow
        'shadow-emerald-400/60', // Green glow
        'shadow-blue-400/60', // Blue glow
        'shadow-purple-400/60', // Purple glow
        'shadow-pink-400/60', // Pink glow
        'shadow-orange-400/60', // Orange glow
    ];
    const shadowColor = shadowColors[index % shadowColors.length];

    return (
        <div
            className={`${colorClass} dark:bg-slate-800 border-2 border-black dark:border-slate-600 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative flex flex-col h-full min-h-[240px] overflow-hidden ${rotation}`}
            style={theme !== 'dark' ? {
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
            } : {}}
        >
            {/* Spiral Binding Effect */}
            <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none`}>
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="relative h-4 w-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
                        <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                    </div>
                ))}
            </div>

            {/* Card Header */}
            <div className="flex justify-between items-start mb-4 border-b-2 border-black/10 dark:border-slate-700/50 pb-3 mt-2">
                <div className="flex items-center gap-2">
                    <h4 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">{list.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${indicatorColor} shadow-lg flex-shrink-0`} style={{
                        boxShadow: theme === 'dark'
                            ? `0 0 8px ${indicatorColor.includes('yellow') ? 'rgba(250, 204, 21, 0.6)' :
                                          indicatorColor.includes('emerald') ? 'rgba(52, 211, 153, 0.6)' :
                                          indicatorColor.includes('blue') ? 'rgba(59, 130, 246, 0.6)' :
                                          indicatorColor.includes('purple') ? 'rgba(147, 51, 234, 0.6)' :
                                          indicatorColor.includes('pink') ? 'rgba(236, 72, 153, 0.6)' :
                                          'rgba(249, 115, 22, 0.6)'}`
                            : '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} />
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{t.itemsCount(list.items.length)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <div className="flex items-center group/edit relative">
                        <span className="text-[10px] font-bold text-black dark:text-slate-100 bg-yellow-400 px-2 py-1 rounded border border-black dark:border-slate-600 transition-all duration-200 opacity-0 group-hover/edit:opacity-100 hover:scale-105 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 shadow-sm cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); onLoad(list); }}>
                            {language === 'he' ? 'למצב עריכה מלא' : 'To full edit mode'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onLoad(list); }}
                            className="h-8 w-8 text-gray-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-slate-700 rounded-full"
                            title={language === 'he' ? 'ערוך רשימה' : 'Edit List'}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title={language === 'he' ? 'מחק רשימה' : 'Delete List'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Preview Items */}
            <div className="flex-1 overflow-hidden relative">
                <ul className="space-y-0">
                    {list.items.slice(0, 5).map((item, i) => {
                        return (
                            <li key={item.id || i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 h-[31px] px-2 hover:bg-black/5 dark:hover:bg-slate-700 dark:border-b dark:border-slate-700/50 dark:last:border-b-0 rounded transition-colors group/item cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleItem(list.id, item.id);
                                }}
                            >
                                <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => onToggleItem(list.id, item.id)}
                                    className="h-4 w-4 border-2 border-gray-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-sm transition-all"
                                />
                                <span className={`truncate w-full font-medium ${item.checked ? 'line-through text-gray-400 dark:text-slate-500 decoration-2 decoration-gray-400 dark:decoration-slate-500' : ''}`}>
                                    {item.text}
                                </span>
                            </li>
                        );
                    })}
                    {list.items.length > 5 && (
                        <li className="text-xs font-bold text-gray-400 dark:text-slate-400 mt-2 px-2 italic">
                            {language === 'he'
                                ? `...ועוד ${list.items.length - 5} פריטים`
                                : `...and ${list.items.length - 5} more items`}
                        </li>
                    )}
                </ul>
                {/* Fade out effect at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 dark:from-slate-800/90 to-transparent pointer-events-none" />
            </div>

            {/* Date Footer */}
            <div className="mt-auto pt-3 border-t-2 border-black/5 dark:border-slate-700/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                    {new Date(list.createdAt || new Date().toISOString()).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                </span>
            </div>
        </div>
    );
};

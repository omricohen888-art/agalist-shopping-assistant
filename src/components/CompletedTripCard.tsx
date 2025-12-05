import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, MapPin, Receipt, Store, ChevronDown } from "lucide-react";
import { ShoppingHistory, UNITS } from "@/types/shopping";
import { useTheme } from "next-themes";

interface CompletedTripCardProps {
  trip: ShoppingHistory;
  index: number;
  language: 'he' | 'en';
  onViewDetails: (trip: ShoppingHistory) => void;
  onDelete: (id: string) => void;
}

export const CompletedTripCard: React.FC<CompletedTripCardProps> = ({
  trip,
  index,
  language,
  onViewDetails,
  onDelete
}) => {
  const { theme } = useTheme();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  // Receipt-like muted color palette
  const cardColors = [
    'bg-slate-50',
    'bg-stone-50',
    'bg-zinc-50',
    'bg-neutral-50',
  ];
  const colorClass = cardColors[index % cardColors.length];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return language === 'he' 
      ? `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const completionRate = Math.round((trip.completedItems / trip.totalItems) * 100);

  return (
    <div
      onClick={() => onViewDetails(trip)}
      className={`${colorClass} dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative flex flex-col min-h-[200px] overflow-hidden`}
      dir={direction}
      style={{
        backgroundImage: theme !== 'dark' 
          ? 'repeating-linear-gradient(transparent, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)' 
          : undefined
      }}
    >
      {/* Completed Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{language === 'he' ? 'הושלם' : 'Completed'}</span>
      </div>

      {/* Header with Store Name */}
      <div className="flex items-start gap-3 mb-3 pt-1">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <Store className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">
            {trip.store}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {formatDate(trip.date)}
          </p>
        </div>
      </div>

      {/* Price Display - Prominent */}
      <div className="flex items-center justify-between py-3 px-4 bg-white/60 dark:bg-slate-900/40 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {language === 'he' ? 'סה״כ' : 'Total'}
          </span>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(trip.totalAmount)}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
        <span>
          {language === 'he' 
            ? `${trip.completedItems} מתוך ${trip.totalItems} פריטים`
            : `${trip.completedItems} of ${trip.totalItems} items`
          }
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          {completionRate}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(trip); }}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>{language === 'he' ? 'צפה בקבלה' : 'View Receipt'}</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
        </button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
          title={language === 'he' ? 'מחק' : 'Delete'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

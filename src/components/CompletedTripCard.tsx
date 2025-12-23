import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, MapPin, Receipt, Store, ChevronRight } from "lucide-react";
import { ShoppingHistory } from "@/types/shopping";

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
  const direction = language === 'he' ? 'rtl' : 'ltr';

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
      className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative flex flex-col min-h-[200px] overflow-hidden"
      dir={direction}
    >
      {/* Completed Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{language === 'he' ? 'הושלם' : 'Completed'}</span>
      </div>

      {/* Header with Store Name */}
      <div className="flex items-start gap-3 mb-4 pt-1">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <Store className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base sm:text-lg text-foreground truncate">
            {trip.store}
          </h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {formatDate(trip.date)}
          </p>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/30 mb-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {language === 'he' ? 'סה״כ' : 'Total'}
          </span>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-foreground">
          {formatCurrency(trip.totalAmount)}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <span>
          {language === 'he' 
            ? `${trip.completedItems} מתוך ${trip.totalItems} פריטים`
            : `${trip.completedItems} of ${trip.totalItems} items`
          }
        </span>
        <span className="text-success font-semibold">
          {completionRate}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-300"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-3 border-t border-border/30 flex justify-between items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(trip); }}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{language === 'he' ? 'צפה בקבלה' : 'View Receipt'}</span>
          <ChevronRight className={`h-4 w-4 ${language === 'he' ? 'rotate-180' : ''}`} />
        </button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          title={language === 'he' ? 'מחק' : 'Delete'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
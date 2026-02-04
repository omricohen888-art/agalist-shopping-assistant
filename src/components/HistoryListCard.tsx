import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, MapPin, Receipt, ChevronRight } from "lucide-react";
import { ShoppingHistory, SHOPPING_TYPES } from "@/types/shopping";
import { getStoreLogo } from "@/data/storeLogos";

interface HistoryListCardProps {
  trip: ShoppingHistory;
  language: 'he' | 'en';
  onViewDetails: (trip: ShoppingHistory) => void;
  onDelete: (id: string) => void;
}

export const HistoryListCard: React.FC<HistoryListCardProps> = ({
  trip,
  language,
  onViewDetails,
  onDelete
}) => {
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
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
      className="bg-card border border-border/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative w-full sm:w-[280px] md:w-[300px]"
      dir={direction}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-foreground">
            {getStoreLogo(trip.store)}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {trip.store}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatDate(trip.date)}
            </p>
          </div>
        </div>
        
        {/* Badge */}
        <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-medium">
          <CheckCircle2 className="h-3 w-3" />
          <span>{language === 'he' ? 'הושלם' : 'Done'}</span>
        </div>
      </div>

      {/* Price & Stats Row */}
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg border border-border/20 mb-3">
        <div className="flex items-center gap-1.5">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {language === 'he' ? 'סה״כ' : 'Total'}
          </span>
        </div>
        <span className="text-base font-bold text-foreground">
          {formatCurrency(trip.totalAmount)}
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>
          {language === 'he' 
            ? `${trip.completedItems}/${trip.totalItems} פריטים`
            : `${trip.completedItems}/${trip.totalItems} items`
          }
        </span>
        <span className="text-success font-medium">{completionRate}%</span>
      </div>
      
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div 
          className="h-full bg-success rounded-full transition-all"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-border/20">
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(trip); }}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{language === 'he' ? 'פרטים' : 'Details'}</span>
          <ChevronRight className={`h-3.5 w-3.5 ${language === 'he' ? 'rotate-180' : ''}`} />
        </button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

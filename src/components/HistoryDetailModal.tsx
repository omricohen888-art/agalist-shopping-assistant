import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Receipt, Store, Calendar, ShoppingBag, X, Package } from "lucide-react";
import { ShoppingHistory, UNITS } from "@/types/shopping";

interface HistoryDetailModalProps {
  trip: ShoppingHistory | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'he' | 'en';
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  trip,
  isOpen,
  onClose,
  language
}) => {
  if (!trip) return null;

  const direction = language === 'he' ? 'rtl' : 'ltr';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return language === 'he' 
      ? `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDisplayQuantityUnit = (item: { quantity: number; unit: string }) => {
    if (item.quantity <= 1 && item.unit === 'units') {
      return '';
    }
    const unitLabel = UNITS.find(u => u.value === item.unit);
    const unitText = language === 'he' ? unitLabel?.labelHe : unitLabel?.labelEn;
    return `${item.quantity} ${unitText}`;
  };

  const completedItems = trip.items.filter(item => item.checked);
  const skippedItems = trip.items.filter(item => !item.checked);
  const avgPricePerItem = trip.completedItems > 0 ? trip.totalAmount / trip.completedItems : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col" dir={direction}>
        {/* Receipt Header */}
        <DialogHeader className="border-b pb-4 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
          
          <div className="flex items-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {trip.listName || trip.store}
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </DialogTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(trip.date)} • {formatTime(trip.date)}
                {trip.listName && trip.store && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded ml-2">{trip.store}</span>
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Receipt Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Total Amount - Hero */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {language === 'he' ? 'סה״כ לתשלום' : 'Total Paid'}
            </p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(trip.totalAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {language === 'he' 
                ? `ממוצע ₪${avgPricePerItem.toFixed(1)} לפריט`
                : `Avg. $${avgPricePerItem.toFixed(2)}/item`
              }
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
              <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{trip.completedItems}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{language === 'he' ? 'נרכשו' : 'Bought'}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
              <Package className="h-5 w-5 text-slate-600 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{trip.totalItems}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{language === 'he' ? 'ברשימה' : 'Listed'}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
              <X className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{skippedItems.length}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{language === 'he' ? 'דולגו' : 'Skipped'}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {/* Purchased Items */}
            {completedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {language === 'he' ? 'פריטים שנרכשו' : 'Purchased Items'}
                </h4>
                <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50">
                  {completedItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                      </div>
                      {getDisplayQuantityUnit(item) && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {getDisplayQuantityUnit(item)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped Items */}
            {skippedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-amber-500" />
                  {language === 'he' ? 'פריטים שדולגו' : 'Skipped Items'}
                </h4>
                <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-700/30 divide-y divide-amber-100 dark:divide-amber-700/20">
                  {skippedItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                          <X className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 line-through">{item.text}</span>
                      </div>
                      {getDisplayQuantityUnit(item) && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                          {getDisplayQuantityUnit(item)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-center">
          <Button onClick={onClose} variant="outline" className="px-8">
            {language === 'he' ? 'סגור' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

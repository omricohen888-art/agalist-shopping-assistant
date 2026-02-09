import { useState, useEffect, useMemo } from "react";
import { EditHistoryModal } from "@/components/EditHistoryModal";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2, Calendar as CalendarIcon, ShoppingCart, Receipt, List, X, Clock, Store, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { ShoppingHistory as ShoppingHistoryType, SHOPPING_TYPES } from "@/types/shopping";
import { toast } from "sonner";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { getStoreLogo } from "@/data/storeLogos";
import { Calendar } from "@/components/ui/calendar";
import { HistoryDetailModal } from "@/components/HistoryDetailModal";

const historyTranslations: Record<
  Language,
  {
    backAria: string;
    title: string;
    subtitle: string;
    stats: {
      totalPurchases: string;
      totalSpend: string;
      averageSpend: string;
    };
    itemsProgress: (completed: number, total: number) => string;
    itemsExtra: (count: number) => string;
    deleteItem: string;
    clearAll: string;
    confirmClear: string;
    toasts: {
      deleted: string;
      cleared: string;
    };
    emptyState: {
      title: string;
      description: string;
      cta: string;
    };
    currencyLabel: string;
    noHistory: string;
    calendarView: string;
    listView: string;
    showAll: string;
    dailySummary: string;
    purchasesOnDay: (count: number) => string;
    viewDetails: string;
  }
> = {
  he: {
    backAria: "חזרה לדף הבית",
    title: "היסטוריית קניות",
    subtitle: "כל הקניות שלך במקום אחד",
    stats: {
      totalPurchases: "סך הקניות",
      totalSpend: "סה״כ הוצאות",
      averageSpend: "ממוצע לקנייה",
    },
    itemsProgress: (completed, total) => `${completed} מתוך ${total} פריטים`,
    itemsExtra: count => `+${count} נוספים`,
    deleteItem: "מחק קנייה",
    clearAll: "מחק הכל",
    confirmClear: "האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?",
    toasts: {
      deleted: "הקנייה נמחקה",
      cleared: "כל ההיסטוריה נמחקה",
    },
    emptyState: {
      title: "אין עדיין קניות",
      description: "סיים קנייה כדי לראות אותה כאן",
      cta: "חזרה לרשימה",
    },
    currencyLabel: "₪",
    noHistory: "אין היסטוריית קניות",
    calendarView: "לוח שנה",
    listView: "רשימה",
    showAll: "הצג הכל",
    dailySummary: "סיכום יומי",
    purchasesOnDay: (count) => `${count} קניות`,
    viewDetails: "צפה בפרטים",
  },
  en: {
    backAria: "Back to shopping list",
    title: "Purchase History",
    subtitle: "All your purchases in one place",
    stats: {
      totalPurchases: "Total trips",
      totalSpend: "Total spend",
      averageSpend: "Average",
    },
    itemsProgress: (completed, total) => `${completed} of ${total} items`,
    itemsExtra: count => `+${count} more`,
    deleteItem: "Delete purchase",
    clearAll: "Clear all",
    confirmClear: "Are you sure you want to delete all history?",
    toasts: {
      deleted: "Purchase deleted",
      cleared: "History cleared",
    },
    emptyState: {
      title: "No purchases yet",
      description: "Finish a shopping trip to see it here",
      cta: "Back to list",
    },
    currencyLabel: "₪",
    noHistory: "No shopping history",
    calendarView: "Calendar",
    listView: "List",
    showAll: "Show all",
    dailySummary: "Daily summary",
    purchasesOnDay: (count) => `${count} purchases`,
    viewDetails: "View details",
  },
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ShoppingHistoryType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ShoppingHistoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState<ShoppingHistoryType | null>(null);
  const { language } = useGlobalLanguage();
  const cloudSync = useCloudSync();
  const { getShoppingHistory, deleteShoppingHistory, clearAllHistory, isLoggedIn, userId } = cloudSync;
  const t = historyTranslations[language];
  const direction = language === "he" ? "rtl" : "ltr";
  const locale = language === "he" ? "he-IL" : "en-US";

  // Load history when userId changes (login/logout)
  useEffect(() => {
    let isMounted = true;
    
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getShoppingHistory();
        if (isMounted) {
          setHistory(data);
        }
      } catch (error) {
        console.error('[History] Failed to load history:', error);
        if (isMounted) {
          setHistory([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadHistory();
    
    return () => {
      isMounted = false;
    };
  }, [getShoppingHistory, userId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await deleteShoppingHistory(id);
      if (success) {
        toast.success(t.toasts.deleted);
        // Refresh data
        const data = await getShoppingHistory();
        setHistory(data);
      }
    } catch (error) {
      console.error('[History] Failed to delete:', error);
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Delete failed');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t.confirmClear)) return;
    try {
      const success = await clearAllHistory();
      if (success) {
        toast.success(t.toasts.cleared);
        setHistory([]);
      }
    } catch (error) {
      console.error('[History] Failed to clear all:', error);
      toast.error(language === 'he' ? 'שגיאה במחיקת ההיסטוריה' : 'Failed to clear history');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const datesWithPurchases = useMemo(() => {
    const dates = new Set<string>();
    history.forEach(item => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);
      dates.add(date.toDateString());
    });
    return dates;
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    return history.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === selectedDate.toDateString();
    });
  }, [history, selectedDate]);

  const dailySummary = useMemo(() => {
    if (!selectedDate) return null;
    const dayItems = history.filter(item =>
      new Date(item.date).toDateString() === selectedDate.toDateString()
    );
    return {
      count: dayItems.length,
      total: dayItems.reduce((sum, item) => sum + item.totalAmount, 0)
    };
  }, [history, selectedDate]);

  const totalSpent = history.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageSpent = history.length > 0 ? totalSpent / history.length : 0;

  const formatCurrency = (amount: number) => {
    return language === 'he'
      ? `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const modifiers = useMemo(() => ({
    hasPurchase: (date: Date) => datesWithPurchases.has(date.toDateString()),
  }), [datesWithPurchases]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'he' ? 'טוען היסטוריה...' : 'Loading history...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={direction} lang={language}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
        <div className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              aria-label={t.backAria}
              className="h-10 w-10 p-0 rounded-xl"
            >
              <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {t.title}
              </h1>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex bg-muted rounded-xl p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3 rounded-lg text-xs font-medium"
              >
                <List className="h-3.5 w-3.5 me-1.5" />
                {t.listView}
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="h-8 px-3 rounded-lg text-xs font-medium"
              >
                <CalendarIcon className="h-3.5 w-3.5 me-1.5" />
                {t.calendarView}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Stats Summary */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border-2 border-border rounded-2xl p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{history.length}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{t.stats.totalPurchases}</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-success/10 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{t.stats.totalSpend}</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-3 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(averageSpent)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{t.stats.averageSpend}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t.emptyState.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t.emptyState.description}</p>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              {t.emptyState.cta}
            </Button>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="space-y-4">
                <div className="bg-card border-2 border-border rounded-2xl p-4 overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="mx-auto"
                    modifiers={modifiers}
                    modifiersClassNames={{
                      hasPurchase: "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-success after:rounded-full"
                    }}
                  />
                </div>

                {selectedDate && dailySummary && dailySummary.count > 0 && (
                  <div className="bg-success/10 border-2 border-success/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{formatShortDate(selectedDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.purchasesOnDay(dailySummary.count)} • {formatCurrency(dailySummary.total)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full rounded-xl"
                  >
                    {t.showAll}
                  </Button>
                )}
              </div>
            )}

            {/* History List */}
            <div className="space-y-3">
              {filteredHistory.length === 0 && selectedDate ? (
                <div className="py-10 text-center text-muted-foreground">
                  {language === 'he' ? 'אין קניות ביום זה' : 'No purchases on this day'}
                </div>
              ) : (
                filteredHistory.map(item => {
                  const isExpanded = expandedCard === item.id;
                  const shoppingType = SHOPPING_TYPES.find(st => st.value === item.shoppingType);

                  return (
                    <div
                      key={item.id}
                      className="bg-card border-2 border-border rounded-2xl overflow-hidden transition-all hover:border-primary/30"
                    >
                      {/* Main Card Content */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setSelectedTrip(item)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Store Logo */}
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-foreground">
                            {getStoreLogo(item.store)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-bold text-foreground truncate">
                                  {item.listName || item.store || t.noHistory}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{formatDate(item.date)}</span>
                                  <span>•</span>
                                  <span>{formatTime(item.date)}</span>
                                  {shoppingType && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        {shoppingType.icon}
                                        {language === 'he' ? shoppingType.labelHe : shoppingType.labelEn}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="text-end shrink-0">
                                <p className="text-lg font-bold text-success">{formatCurrency(item.totalAmount)}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.itemsProgress(item.completedItems, item.totalItems)}
                                </p>
                              </div>
                            </div>

                            {/* Items Preview */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {item.items.slice(0, 4).map(shopItem => (
                                <span
                                  key={shopItem.id}
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                    shopItem.checked
                                      ? "bg-success/15 text-success"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {shopItem.checked && "✓ "}
                                  {shopItem.text}
                                </span>
                              ))}
                              {item.items.length > 4 && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {t.itemsExtra(item.items.length - 4)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Actions */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-border/50">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTrip(item)}
                              className="flex-1 rounded-xl"
                            >
                              {t.viewDetails}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setEditingTrip(item); }}
                              className="rounded-xl"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => handleDelete(item.id, e)}
                              className="rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Expand/Collapse Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(isExpanded ? null : item.id);
                        }}
                        className="w-full py-2 border-t border-border/50 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clear All Button */}
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t.clearAll}
              </Button>
            )}
          </>
        )}
      </div>

      {/* History Detail Modal */}
      <HistoryDetailModal
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onEdit={(trip) => { setSelectedTrip(null); setEditingTrip(trip); }}
        language={language}
      />

      <EditHistoryModal
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={async (updatedTrip) => {
          const success = await cloudSync.updateShoppingHistory(updatedTrip);
          if (success) {
            const data = await getShoppingHistory();
            setHistory(data);
            toast.success(language === 'he' ? 'הקנייה עודכנה' : 'Purchase updated');
          }
        }}
        language={language}
      />
    </div>
  );
};

export default History;
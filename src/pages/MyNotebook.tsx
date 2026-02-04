import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SavedList, ShoppingItem, ShoppingHistory } from "@/types/shopping";
import { SavedListCard } from "@/components/SavedListCard";
import { HistoryListCard } from "@/components/HistoryListCard";
import { HistoryDetailModal } from "@/components/HistoryDetailModal";
import { EditListModal } from "@/components/EditListModal";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Plus, Book, ClipboardList, ShoppingCart, CheckCircle, Calendar } from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isWithinInterval, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

const MyNotebook = () => {
    const navigate = useNavigate();
    const { language } = useGlobalLanguage();
    const t = translations[language];
    const direction = language === 'he' ? 'rtl' : 'ltr';
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingHistory[]>([]);
    const [editingList, setEditingList] = useState<SavedList | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<ShoppingHistory | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const cloudSync = useCloudSync();
    const { onLogout } = useAuth();

    // Load data on mount
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            try {
                const [lists, history] = await Promise.all([
                    cloudSync.getSavedLists(),
                    cloudSync.getShoppingHistory()
                ]);
                
                if (isMounted) {
                    setSavedLists(lists);
                    setShoppingHistory(history);
                }
            } catch (error) {
                console.error('[MyNotebook] Failed to load data:', error);
            }
        };
        
        loadData();
        
        return () => {
            isMounted = false;
        };
    }, [cloudSync.getSavedLists, cloudSync.getShoppingHistory, cloudSync.userId]);

    // Clear data on logout
    useEffect(() => {
        const unsubscribe = onLogout(() => {
            setSavedLists([]);
            setShoppingHistory([]);
            setEditingList(null);
            setSelectedTrip(null);
        });
        return unsubscribe;
    }, [onLogout]);

    // Date filtering for saved lists
    const filteredLists = useMemo(() => {
        if (dateFilter === 'all') return savedLists;
        
        const now = new Date();
        return savedLists.filter(list => {
            const listDate = new Date(list.createdAt);
            switch (dateFilter) {
                case 'today':
                    return isWithinInterval(listDate, { start: startOfDay(now), end: endOfDay(now) });
                case 'week':
                    return isWithinInterval(listDate, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
                case 'month':
                    return isWithinInterval(listDate, { start: startOfDay(subMonths(now, 1)), end: endOfDay(now) });
                case 'custom':
                    if (customDateRange?.from && customDateRange?.to) {
                        return isWithinInterval(listDate, { 
                            start: startOfDay(customDateRange.from), 
                            end: endOfDay(customDateRange.to) 
                        });
                    }
                    return true;
                default:
                    return true;
            }
        });
    }, [savedLists, dateFilter, customDateRange]);

    // Date filtering for shopping history
    const filteredHistory = useMemo(() => {
        if (dateFilter === 'all') return shoppingHistory;
        
        const now = new Date();
        return shoppingHistory.filter(trip => {
            const tripDate = new Date(trip.date);
            switch (dateFilter) {
                case 'today':
                    return isWithinInterval(tripDate, { start: startOfDay(now), end: endOfDay(now) });
                case 'week':
                    return isWithinInterval(tripDate, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
                case 'month':
                    return isWithinInterval(tripDate, { start: startOfDay(subMonths(now, 1)), end: endOfDay(now) });
                case 'custom':
                    if (customDateRange?.from && customDateRange?.to) {
                        return isWithinInterval(tripDate, { 
                            start: startOfDay(customDateRange.from), 
                            end: endOfDay(customDateRange.to) 
                        });
                    }
                    return true;
                default:
                    return true;
            }
        });
    }, [shoppingHistory, dateFilter, customDateRange]);

    // Categorization
    const { readyLists, inProgressLists, completedLists } = useMemo(() => {
        const ready = filteredLists.filter(list => {
            const completedCount = list.items.filter(item => item.checked).length;
            return !list.isShoppingComplete && completedCount === 0;
        });
        
        const inProgress = filteredLists.filter(list => {
            const completedCount = list.items.filter(item => item.checked).length;
            return !list.isShoppingComplete && completedCount > 0;
        });
        
        const completed = filteredLists.filter(list => list.isShoppingComplete);
        
        return { readyLists: ready, inProgressLists: inProgress, completedLists: completed };
    }, [filteredLists]);

    // Combined completed count for badge
    const totalCompletedCount = completedLists.length + filteredHistory.length;

    const dateFilters: { value: DateFilterType; labelHe: string; labelEn: string }[] = [
        { value: 'all', labelHe: 'הכל', labelEn: 'All' },
        { value: 'today', labelHe: 'היום', labelEn: 'Today' },
        { value: 'week', labelHe: 'שבוע', labelEn: 'Week' },
        { value: 'month', labelHe: 'חודש', labelEn: 'Month' },
    ];

    const handleDeleteList = async (id: string) => {
        if (window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק רשימה זו?' : 'Are you sure you want to delete this list?')) {
            const success = await cloudSync.deleteSavedList(id);
            if (success) {
                const lists = await cloudSync.getSavedLists();
                setSavedLists(lists);
                toast.success(language === 'he' ? 'הרשימה נמחקה' : 'List deleted');
            }
        }
    };

    const handleDeleteHistory = async (id: string) => {
        if (window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק קנייה זו?' : 'Are you sure you want to delete this trip?')) {
            const success = await cloudSync.deleteShoppingHistory(id);
            if (success) {
                const history = await cloudSync.getShoppingHistory();
                setShoppingHistory(history);
                toast.success(language === 'he' ? 'הקנייה נמחקה' : 'Trip deleted');
            }
        }
    };

    const handleToggleItemInList = async (listId: string, itemId: string) => {
        const list = savedLists.find(l => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );

        const updatedList = { ...list, items: updatedItems };
        const success = await cloudSync.updateSavedList(updatedList);
        if (success) {
            const lists = await cloudSync.getSavedLists();
            setSavedLists(lists);
        }
    };

    const handleEditList = (list: SavedList) => {
        setEditingList(list);
        setIsEditModalOpen(true);
    };

    const handleSaveList = async () => {
        const lists = await cloudSync.getSavedLists();
        setSavedLists(lists);
    };

    const handleUpdateItem = async (listId: string, item: ShoppingItem) => {
        const list = savedLists.find(l => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map(i => i.id === item.id ? item : i);
        const updatedList = { ...list, items: updatedItems };
        const success = await cloudSync.updateSavedList(updatedList);
        if (success) {
            const lists = await cloudSync.getSavedLists();
            setSavedLists(lists);
        }
    };

    const handleGoShopping = (list: SavedList) => {
        localStorage.setItem(`shoppingList_${list.id}`, JSON.stringify({
            id: list.id,
            name: list.name,
            items: list.items,
            createdAt: list.createdAt
        }));
        navigate(`/shopping/${list.id}`);
    };

    const handleViewHistoryDetails = (trip: ShoppingHistory) => {
        setSelectedTrip(trip);
        setIsHistoryModalOpen(true);
    };

    const isEmpty = savedLists.length === 0 && shoppingHistory.length === 0;

    return (
        <div className="min-h-screen bg-background pb-24" dir={direction}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-muted rounded-xl h-10 w-10">
                            {direction === 'rtl' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Book className="h-5 w-5 text-primary" />
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t.myListsTitle}</h1>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/')} className="font-medium h-10 px-6 rounded-xl">
                        <Plus className={`h-5 w-5 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                        {language === 'he' ? 'רשימה חדשה' : 'New List'}
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
                {/* Date Filter */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-1">
                        {language === 'he' ? 'תאריך:' : 'Date:'}
                    </span>
                    {dateFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => {
                                setDateFilter(filter.value);
                                if (filter.value !== 'custom') {
                                    setCustomDateRange(undefined);
                                }
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                dateFilter === filter.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {language === 'he' ? filter.labelHe : filter.labelEn}
                        </button>
                    ))}
                    
                    {/* Custom Date Range */}
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <button 
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                                    dateFilter === 'custom' 
                                        ? "bg-primary text-primary-foreground shadow-sm" 
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                {dateFilter === 'custom' && customDateRange?.from && customDateRange?.to
                                    ? `${format(customDateRange.from, 'dd/MM')} - ${format(customDateRange.to, 'dd/MM')}`
                                    : (language === 'he' ? 'מותאם' : 'Custom')
                                }
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="range"
                                selected={customDateRange}
                                onSelect={(range) => {
                                    setCustomDateRange(range);
                                    if (range?.from && range?.to) {
                                        setDateFilter('custom');
                                        setIsCalendarOpen(false);
                                    }
                                }}
                                locale={language === 'he' ? he : enUS}
                                className={cn("p-3 pointer-events-auto")}
                                numberOfMonths={1}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {isEmpty ? (
                    <div className="text-center py-12 sm:py-24">
                        <div className="bg-card p-6 sm:p-12 rounded-2xl shadow-sm border border-border inline-block max-w-md mx-auto w-full">
                            <Book className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                                {language === 'he' ? 'הפנקס שלך ריק' : 'Your notebook is empty'}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                                {language === 'he'
                                    ? 'עדיין לא שמרת רשימות. צור רשימה חדשה ושמור אותה כדי לראות אותה כאן.'
                                    : 'You haven\'t saved any lists yet. Create a new list and save it to see it here.'}
                            </p>
                            <Button onClick={() => navigate('/')} className="font-medium h-10 sm:h-11 px-6 sm:px-8 rounded-xl w-full sm:w-auto">
                                {language === 'he' ? 'צור רשימה ראשונה' : 'Create First List'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="ready" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 h-auto p-1.5 rounded-2xl bg-muted/60 mb-6 gap-1">
                            <TabsTrigger 
                                value="completed"
                                className="rounded-xl py-3 px-2 data-[state=active]:bg-green-500/15 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-green-500/30 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-all"
                            >
                                <CheckCircle className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                                <span className="text-[10px] sm:text-sm font-medium">{language === 'he' ? 'הושלמו' : 'Completed'}</span>
                                <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px]">
                                    {totalCompletedCount}
                                </span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="inProgress"
                                className="rounded-xl py-3 px-2 data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-500/30 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-all"
                            >
                                <ShoppingCart className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                                <span className="text-[10px] sm:text-sm font-medium">{language === 'he' ? 'בתהליך' : 'In Progress'}</span>
                                <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px]">
                                    {inProgressLists.length}
                                </span>
                            </TabsTrigger>
                            
                            <TabsTrigger 
                                value="ready" 
                                className="rounded-xl py-3 px-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/30 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-all"
                            >
                                <ClipboardList className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                                <span className="text-[10px] sm:text-sm font-medium">{language === 'he' ? 'מוכנות' : 'Ready'}</span>
                                <span className="bg-primary/20 text-primary text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px]">
                                    {readyLists.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="ready" className="mt-0">
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
                                {/* Section Header - Mobile visible */}
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/20">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold text-foreground">
                                        {language === 'he' ? 'רשימות מוכנות' : 'Ready Lists'}
                                    </h2>
                                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                                        {readyLists.length}
                                    </span>
                                </div>
                                
                                {readyLists.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">{language === 'he' ? 'אין רשימות ממתינות' : 'No lists waiting'}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {readyLists.map((list, index) => (
                                            <SavedListCard
                                                key={list.id}
                                                list={list}
                                                index={index}
                                                language={language}
                                                t={t}
                                                onEdit={handleEditList}
                                                onDelete={handleDeleteList}
                                                onToggleItem={handleToggleItemInList}
                                                onUpdateItem={handleUpdateItem}
                                                onGoShopping={handleGoShopping}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="inProgress" className="mt-0">
                            <div className="bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl p-4 sm:p-6 border border-orange-500/20">
                                {/* Section Header - Mobile visible */}
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-orange-500/20">
                                    <ShoppingCart className="h-5 w-5 text-orange-500" />
                                    <h2 className="font-semibold text-foreground">
                                        {language === 'he' ? 'קניות בתהליך' : 'In Progress'}
                                    </h2>
                                    <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {inProgressLists.length}
                                    </span>
                                </div>
                                
                                {inProgressLists.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">{language === 'he' ? 'אין קניות פעילות' : 'No active shopping'}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {inProgressLists.map((list, index) => (
                                            <SavedListCard
                                                key={list.id}
                                                list={list}
                                                index={index}
                                                language={language}
                                                t={t}
                                                onEdit={handleEditList}
                                                onDelete={handleDeleteList}
                                                onToggleItem={handleToggleItemInList}
                                                onUpdateItem={handleUpdateItem}
                                                onGoShopping={handleGoShopping}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="completed" className="mt-0">
                            <div className="bg-green-500/5 dark:bg-green-500/10 rounded-2xl p-4 sm:p-6 border border-green-500/20">
                                {/* Section Header - Mobile visible */}
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-green-500/20">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <h2 className="font-semibold text-foreground">
                                        {language === 'he' ? 'קניות שהושלמו' : 'Completed Shopping'}
                                    </h2>
                                    <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {totalCompletedCount}
                                    </span>
                                </div>
                                
                                {totalCompletedCount === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">{language === 'he' ? 'עדיין לא השלמת קניות' : 'No completed shopping yet'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Completed SavedLists */}
                                        {completedLists.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {completedLists
                                                    .sort((a, b) => new Date(b.shoppingCompletedAt || b.createdAt).getTime() - new Date(a.shoppingCompletedAt || a.createdAt).getTime())
                                                    .map((list, index) => (
                                                        <SavedListCard
                                                            key={list.id}
                                                            list={list}
                                                            index={index}
                                                            language={language}
                                                            t={t}
                                                            onEdit={handleEditList}
                                                            onDelete={handleDeleteList}
                                                            onToggleItem={handleToggleItemInList}
                                                            onUpdateItem={handleUpdateItem}
                                                            onGoShopping={handleGoShopping}
                                                        />
                                                    ))}
                                            </div>
                                        )}

                                        {/* Separator if both types exist */}
                                        {completedLists.length > 0 && filteredHistory.length > 0 && (
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="flex-1 h-px bg-green-500/30" />
                                                <span className="text-xs text-green-600 dark:text-green-400 px-2 font-medium">
                                                    {language === 'he' ? 'היסטוריית קניות' : 'Shopping History'}
                                                </span>
                                                <div className="flex-1 h-px bg-green-500/30" />
                                            </div>
                                        )}

                                        {/* Shopping History */}
                                        {filteredHistory.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {filteredHistory
                                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                    .map((trip) => (
                                                        <HistoryListCard
                                                            key={trip.id}
                                                            trip={trip}
                                                            language={language}
                                                            onViewDetails={handleViewHistoryDetails}
                                                            onDelete={handleDeleteHistory}
                                                        />
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Edit List Modal */}
            <EditListModal
                list={editingList}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingList(null);
                }}
                onSave={handleSaveList}
                language={language}
            />

            {/* History Detail Modal */}
            <HistoryDetailModal
                trip={selectedTrip}
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedTrip(null);
                }}
                language={language}
            />
        </div>
    );
};

export default MyNotebook;

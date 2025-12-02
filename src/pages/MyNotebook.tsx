import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedList } from "@/types/shopping";
import { getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { SavedListCard } from "@/components/SavedListCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Plus, Book } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/utils/translations";

const MyNotebook = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    const direction = language === 'he' ? 'rtl' : 'ltr';
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);

    useEffect(() => {
        setSavedLists(getSavedLists());
    }, []);

    const handleDeleteList = (id: string) => {
        if (window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק רשימה זו?' : 'Are you sure you want to delete this list?')) {
            deleteSavedList(id);
            setSavedLists(getSavedLists());
        }
    };

    const handleToggleItemInList = (listId: string, itemId: string) => {
        const list = savedLists.find(l => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );

        const updatedList = { ...list, items: updatedItems };
        updateSavedList(updatedList);
        setSavedLists(getSavedLists());
    };

    const handleLoadList = (list: SavedList) => {
        navigate('/', { state: { loadList: list } });
    };

    return (
        <div className="min-h-screen bg-background pb-20" dir={direction}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full h-10 w-10">
                            {direction === 'rtl' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Book className="h-6 w-6 text-primary" />
                            <h1 className="text-xl sm:text-2xl font-black text-foreground">{t.myListsTitle}</h1>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 px-6 rounded-lg border-2 border-black dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="mr-2 h-5 w-5" />
                        {language === 'he' ? 'רשימה חדשה' : 'New List'}
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                {/* Urban Decorations */}
                <div className="mb-8 text-center">
                    <p className="text-muted-foreground font-medium text-lg">
                        {language === 'he'
                            ? 'כל הרשימות שלך במקום אחד. מסודרות, שמורות ומוכנות לקנייה הבאה.'
                            : 'All your lists in one place. Organized, saved, and ready for your next shop.'}
                    </p>
                </div>

                {savedLists.length === 0 ? (
                    <div className="text-center py-12 sm:py-24">
                        <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 inline-block max-w-md mx-auto w-full">
                            <Book className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                                {language === 'he' ? 'הפנקס שלך ריק' : 'Your notebook is empty'}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm sm:text-base font-medium">
                                {language === 'he'
                                    ? 'עדיין לא שמרת רשימות. צור רשימה חדשה ושמור אותה כדי לראות אותה כאן.'
                                    : 'You haven\'t saved any lists yet. Create a new list and save it to see it here.'}
                            </p>
                            <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 sm:h-11 px-6 sm:px-8 border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all w-full sm:w-auto">
                                {language === 'he' ? 'צור רשימה ראשונה' : 'Create First List'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {savedLists.map((list, index) => (
                            <SavedListCard
                                key={list.id}
                                list={list}
                                index={index}
                                language={language}
                                t={t}
                                onLoad={handleLoadList}
                                onDelete={handleDeleteList}
                                onToggleItem={handleToggleItemInList}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyNotebook;

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
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 pb-20" dir={direction}>
            {/* Header */}
            <div className="bg-stone-200 dark:bg-slate-900 text-black dark:text-slate-100 shadow-sm sticky top-0 z-10 border-b-2 border-black/10 dark:border-slate-700/50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                            {direction === 'rtl' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Book className="h-6 w-6" />
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t.myListsTitle}</h1>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/')} className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Plus className="mr-2 h-4 w-4" />
                        {language === 'he' ? 'רשימה חדשה' : 'New List'}
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Urban Decorations */}
                <div className="mb-8 text-center">
                    <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">
                        {language === 'he'
                            ? 'כל הרשימות שלך במקום אחד. מסודרות, שמורות ומוכנות לקנייה הבאה.'
                            : 'All your lists in one place. Organized, saved, and ready for your next shop.'}
                    </p>
                </div>

                {savedLists.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border-2 border-dashed border-stone-300 dark:border-slate-600 inline-block max-w-md mx-auto">
                            <Book className="h-16 w-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-stone-700 dark:text-stone-200 mb-2">
                                {language === 'he' ? 'הפנקס שלך ריק' : 'Your notebook is empty'}
                            </h3>
                            <p className="text-stone-500 mb-6">
                                {language === 'he'
                                    ? 'עדיין לא שמרת רשימות. צור רשימה חדשה ושמור אותה כדי לראות אותה כאן.'
                                    : 'You haven\'t saved any lists yet. Create a new list and save it to see it here.'}
                            </p>
                            <Button onClick={() => navigate('/')} className="bg-black text-yellow-400 hover:bg-stone-800 font-bold">
                                {language === 'he' ? 'צור רשימה ראשונה' : 'Create First List'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

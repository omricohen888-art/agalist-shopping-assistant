import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedList } from "@/types/shopping";
import { getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { SavedListCard } from "@/components/SavedListCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Plus, Book } from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translations";

const MyNotebook = () => {
    const navigate = useNavigate();
    const { language } = useGlobalLanguage();
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

            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
                <div className="mb-8 text-center">
                    <p className="text-muted-foreground text-base sm:text-lg">
                        {language === 'he'
                            ? 'כל הרשימות שלך במקום אחד. מסודרות, שמורות ומוכנות לקנייה הבאה.'
                            : 'All your lists in one place. Organized, saved, and ready for your next shop.'}
                    </p>
                </div>

                {savedLists.length === 0 ? (
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

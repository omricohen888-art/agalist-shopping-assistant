import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Info, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/utils/translations";

const About = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    const direction = language === 'he' ? 'rtl' : 'ltr';

    return (
        <div className="min-h-screen bg-background pb-20" dir={direction}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full h-10 w-10">
                        {direction === 'rtl' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-black text-foreground">{t.navigation.about}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
                <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    <div className="relative z-10 text-center space-y-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                            <ShoppingCart className="h-10 w-10 text-primary-foreground" />
                        </div>

                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2">{t.appTitle}</h2>
                            <p className="text-lg sm:text-xl font-bold text-muted-foreground">{t.tagline}</p>
                        </div>

                        <div className="space-y-6 text-base sm:text-lg leading-relaxed text-foreground font-medium">
                            <p>
                                {t.about.description}
                            </p>
                            <p>
                                {language === 'he'
                                    ? 'אנחנו מאמינים שקניות צריכות להיות פשוטות, מהירות ומאורגנות. האפליקציה שלנו עוזרת לך לתכנן, לעקוב ולחסוך.'
                                    : 'We believe shopping should be simple, fast, and organized. Our app helps you plan, track, and save.'}
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t-2 border-black/10 dark:border-white/10">
                            <span className="inline-block px-4 py-2 bg-muted text-muted-foreground font-bold rounded-full text-sm border-2 border-black/5 dark:border-white/5">
                                {t.about.betaNotice}
                            </span>
                            <p className="text-sm text-muted-foreground mt-4 font-mono font-bold">
                                v1.0.0 • Made with ❤️
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

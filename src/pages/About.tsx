import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Info, ShoppingCart } from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { translations } from "@/utils/translations";

const About = () => {
    const navigate = useNavigate();
    const { language } = useGlobalLanguage();
    const t = translations[language];
    const direction = language === 'he' ? 'rtl' : 'ltr';

    return (
        <div className="min-h-screen bg-background pb-24" dir={direction}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-muted rounded-xl h-10 w-10">
                        {direction === 'rtl' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t.navigation.about}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
                <div className="bg-card p-6 sm:p-12 rounded-2xl shadow-sm border border-border relative overflow-hidden">
                    <div className="relative z-10 text-center space-y-6 sm:space-y-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl">
                            <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{t.appTitle}</h2>
                            <p className="text-base sm:text-xl text-muted-foreground">{t.tagline}</p>
                        </div>

                        <div className="space-y-4 sm:space-y-6 text-sm sm:text-base leading-relaxed text-foreground">
                            <p>
                                {t.about.description}
                            </p>
                            <p>
                                {language === 'he'
                                    ? 'אנחנו מאמינים שקניות צריכות להיות פשוטות, מהירות ומאורגנות. האפליקציה שלנו עוזרת לך לתכנן, לעקוב ולחסוך.'
                                    : 'We believe shopping should be simple, fast, and organized. Our app helps you plan, track, and save.'}
                            </p>
                        </div>

                        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                            <span className="inline-block px-4 py-2 bg-muted text-muted-foreground rounded-full text-xs sm:text-sm">
                                {t.about.betaNotice}
                            </span>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
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

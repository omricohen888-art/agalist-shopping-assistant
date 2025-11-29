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
        <div className="min-h-screen bg-stone-100" dir={direction}>
            {/* Header */}
            <div className="bg-stone-200 text-black shadow-sm sticky top-0 z-10 border-b-2 border-black/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-black hover:bg-black/10 rounded-full">
                            {direction === 'rtl' ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Info className="h-6 w-6" />
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t.navigation.about}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                            <ShoppingCart className="h-10 w-10 text-black" />
                        </div>

                        <h2 className="text-3xl font-black mb-2">{t.appTitle}</h2>
                        <p className="text-xl font-bold text-stone-500 mb-8">{t.tagline}</p>

                        <div className="space-y-6 text-lg leading-relaxed text-stone-700">
                            <p>
                                {t.about.description}
                            </p>
                            <p>
                                {language === 'he'
                                    ? 'אנחנו מאמינים שקניות צריכות להיות פשוטות, מהירות ומאורגנות. האפליקציה שלנו עוזרת לך לתכנן, לעקוב ולחסוך.'
                                    : 'We believe shopping should be simple, fast, and organized. Our app helps you plan, track, and save.'}
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t-2 border-dashed border-stone-200">
                            <span className="inline-block px-4 py-2 bg-stone-100 text-stone-600 font-bold rounded-full text-sm border border-stone-300">
                                {t.about.betaNotice}
                            </span>
                            <p className="text-sm text-stone-400 mt-4 font-mono">
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

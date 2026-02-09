import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalAnnouncement {
    active: boolean;
    message: string;
    type: 'info' | 'warning';
}

export const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState<GlobalAnnouncement | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchAnnouncement();

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'system_settings',
                    filter: 'key=eq.global_announcement',
                },
                (payload) => {
                    console.log('Announcement updated:', payload.new);
                    if (payload.new && payload.new.value) {
                        setAnnouncement(payload.new.value);
                        setIsVisible(true); // Re-show on update
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAnnouncement = async () => {
        const { data } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'global_announcement')
            .single();

        if (data && data.value) {
            setAnnouncement(data.value);
        }
    };

    if (!announcement || !announcement.active || !isVisible) return null;

    const isWarning = announcement.type === 'warning';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`relative w-full px-4 py-3 flex items-start justify-center gap-3 shadow-md ${isWarning
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                    }`}
            >
                <div className="mt-0.5 shrink-0">
                    {isWarning ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-sm font-medium pt-0.5 text-center">
                    {announcement.message}
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className={`shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isWarning ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'
                        }`}
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

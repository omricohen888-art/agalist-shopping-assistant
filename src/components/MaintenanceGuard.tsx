import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import MaintenancePage from '@/pages/MaintenancePage';

const ADMIN_EMAIL = 'omri.cohen888@gmail.com';

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

export const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
    const { user, loading: authLoading } = useAuth();
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        // Initial Fetch
        fetchMaintenanceStatus();

        // Subscribe to Realtime Updates
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'system_settings',
                    filter: 'key=eq.maintenance_mode',
                },
                (payload) => {
                    console.log('Maintenance mode changed:', payload.new);
                    setIsMaintenanceMode(payload.new.value);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMaintenanceStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();

            if (data) {
                setIsMaintenanceMode(data.value);
            }
        } catch (error) {
            console.error('Error checking maintenance mode:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    if (authLoading || loadingSettings) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Allow Admin to bypass maintenance mode
    // Use optional chaining for safety as requested
    const isAdmin = user?.email === ADMIN_EMAIL;

    // Strict Guard:
    // 1. Maintenance Mode is ON
    // 2. AND User is NOT the admin (includes guests/null users)
    if (isMaintenanceMode && !isAdmin) {
        return <MaintenancePage />;
    }

    return <>{children}</>;
};

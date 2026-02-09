import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, ShieldAlert, Users, List, Activity } from 'lucide-react';

const ADMIN_EMAIL = 'omri.cohen888@gmail.com';
const ADMIN_PIN = '12345678';

export default function Admin() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Security Layer 1: Check Email
    useEffect(() => {
        if (!loading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "You do not have permission to view this page.",
                });
                navigate('/');
            }
        }
    }, [user, loading, navigate, toast]);

    // Fetch Initial Settings & Stats once Authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
            fetchStats();
        }
    }, [isAuthenticated]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            toast({
                title: "Admin Access Granted",
                description: "Welcome back, Commander.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "Incorrect PIN code.",
            });
            setPin('');
        }
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'maintenance_mode')
            .single();

        if (data) {
            setMaintenanceMode(data.value);
        }
        if (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchStats = async () => {
        setIsLoadingStats(true);
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) {
            console.error('Error fetching stats:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load system statistics.",
            });
        } else {
            setStats(data);
        }
        setIsLoadingStats(false);
    };

    const toggleMaintenanceMode = async (checked: boolean) => {
        // Optimistic UI update
        setMaintenanceMode(checked);

        const { error } = await supabase
            .from('system_settings')
            .upsert({
                key: 'maintenance_mode',
                value: checked,
                updated_at: new Date().toISOString()
            });

        if (error) {
            // Revert on error
            setMaintenanceMode(!checked);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update maintenance mode.",
            });
        } else {
            toast({
                title: checked ? "Maintenance Mode ENABLED" : "Maintenance Mode DISABLED",
                description: checked ? "The app is now locked for non-admins." : "The app is live for everyone.",
            });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return null; // Will trigger redirect in useEffect
    }

    // Security Layer 2: PIN Screen
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <Lock className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Admin Locked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pin">Enter Security PIN</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    placeholder="••••••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="text-center text-lg tracking-widest"
                                    maxLength={8}
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" className="w-full" size="lg">
                                Unlock Dashboard
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Dashboard UI
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-8 pb-32">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
                    <p className="text-muted-foreground">Manage global settings and view statistics.</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-mono text-sm border border-blue-200 dark:border-blue-800">
                    v0.1.0-BETA
                </div>
            </header>

            {/* Quick Actions */}
            <section className="grid md:grid-cols-2 gap-6">
                {/* Maintenance Mode Card */}
                <Card className={`border-l-4 ${maintenanceMode ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-l-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">
                            System Status
                        </CardTitle>
                        <ShieldAlert className={`h-5 w-5 ${maintenanceMode ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mt-4">
                            <div className="space-y-1">
                                <p className={`text-2xl font-bold ${maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                    {maintenanceMode ? 'MAINTENANCE MODE' : 'SYSTEM ONLINE'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {maintenanceMode
                                        ? 'Only admins can access the app.'
                                        : 'All users have full access.'}
                                </p>
                            </div>
                            <Switch
                                checked={maintenanceMode}
                                onCheckedChange={toggleMaintenanceMode}
                                className="scale-125"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Database Connection Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Database</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Connected</div>
                        <p className="text-xs text-muted-foreground">
                            Supabase region: eu-central-1
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* Stats Overview */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.total_users || '-'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.total_lists || '-'}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Recent Users Table */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="space-y-4">
                            {stats?.recent_users?.map((u: any, i: number) => (
                                <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {u.email?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{u.email}</span>
                                            <span className="text-xs text-muted-foreground">User ID: ...</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Last login: {new Date(u.last_sign_in_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recent_users || stats.recent_users.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent user data available.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

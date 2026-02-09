import React, { useState, useEffect } from 'react';
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

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Admin Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <div className="bg-red-50 text-red-900 p-4 rounded-lg shadow-sm border border-red-200 inline-block text-left">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Something went wrong
                        </h2>
                        <p className="mb-4">The admin panel encountered an error.</p>
                        <pre className="bg-white/50 p-3 rounded text-xs font-mono overflow-auto max-w-lg border border-red-100">
                            {this.state.error?.toString()}
                        </pre>
                        <Button
                            variant="outline"
                            className="mt-4 w-full border-red-200 hover:bg-red-100 hover:text-red-900"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Home
                        </Button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function AdminContent() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    console.log('[Admin] Render:', { user: user?.email, loading });

    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [adminPin, setAdminPin] = useState('12345678'); // Default fallback
    const [newPin, setNewPin] = useState('');
    const [isChangingPin, setIsChangingPin] = useState(false);

    // Security Layer 1: Check Email (Normalized)
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/auth');
            } else {
                const userEmail = user.email?.toLowerCase() || '';
                const adminEmail = ADMIN_EMAIL.toLowerCase();

                console.log('[Admin] Checking Email:', { userEmail, adminEmail, match: userEmail === adminEmail });

                if (userEmail !== adminEmail) {
                    console.warn('[Admin] Email mismatch - Access Denied');
                }
            }
        }
    }, [user, loading, navigate]);

    // Fetch Initial Settings & Stats once Authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log('[Admin] Authenticated. Fetching data...');
            fetchSettings();
            fetchStats();
        } else {
            // Fetch PIN regardless of auth to validate input
            fetchPin();
        }
    }, [isAuthenticated]);

    const fetchPin = async () => {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'admin_pin')
            .single();

        if (data) {
            // Remove quotes if stored as JSON string
            const cleanPin = typeof data.value === 'string' ? data.value.replace(/"/g, '') : String(data.value);
            setAdminPin(cleanPin);
            console.log('[Admin] PIN Fetched');
        }
        if (error) {
            console.warn('[Admin] Could not fetch PIN (using default):', error.message);
        }
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Admin] PIN Submitted');
        if (pin === adminPin) {
            setIsAuthenticated(true);
            toast({
                title: "Access Granted",
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

    const handlePinChange = async () => {
        if (!newPin || newPin.length < 4) {
            toast({
                variant: 'destructive',
                title: 'Invalid PIN',
                description: 'PIN must be at least 4 characters.'
            });
            return;
        }

        const { error } = await supabase
            .from('system_settings')
            .update({
                value: JSON.stringify(newPin),
                updated_at: new Date().toISOString()
            })
            .eq('key', 'admin_pin');

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update PIN: ' + error.message
            });
        } else {
            setAdminPin(newPin);
            setNewPin('');
            setIsChangingPin(false);
            toast({
                title: 'Success',
                description: 'Admin PIN updated successfully.'
            });
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
            console.error('[Admin] Error fetching settings:', error);
        }
    };

    const fetchStats = async () => {
        setIsLoadingStats(true);
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) {
            console.error('[Admin] Error fetching stats:', error);
            // Show more detailed error to user
            toast({
                variant: "destructive",
                title: "Stats Error",
                description: error.message || "Failed to load system statistics.",
            });
        } else {
            setStats(data);
        }
        setIsLoadingStats(false);
    };

    const toggleMaintenanceMode = async (checked: boolean) => {
        // SECURITY CHECK - BLOCKING
        // Using window.prompt to force a halt in execution
        const password = window.prompt("⚠️ פעולה רגישה! הכנס סיסמת מנהל להפעלת מצב חירום:");

        if (password !== 'omri1991') {
            // Revert the switch visually since the action is cancelled
            setMaintenanceMode(!checked);

            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'סיסמה שגויה! הפעולה בוטלה.'
            });
            return; // <--- CRITICAL: STOPS EXECUTION HERE
        }

        // 1. Optimistic UI update
        setMaintenanceMode(checked);

        // 2. Perform the update
        const { error } = await supabase
            .from('system_settings')
            .update({ value: checked })
            .eq('key', 'maintenance_mode');

        if (error) {
            console.error('Error toggling maintenance:', error);
            // Revert on error
            setMaintenanceMode(!checked);
            toast({
                variant: "destructive",
                title: "Error",
                description: 'שגיאה בעדכון המערכת',
            });
        } else {
            toast({
                title: 'Success',
                description: 'סטטוס מערכת עודכן בהצלחה',
            });
        }
    };

    const handlePinChangeClick = () => {
        const auth = window.prompt("הכנס סיסמת מאסטר לשינוי קוד גישה:");
        if (auth !== 'omri1991') {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'סיסמה שגויה! אין הרשאה לשנות קוד.'
            });
            return;
        }
        setIsChangingPin(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user) return null; // Wait for redirect

    const userEmail = user.email?.toLowerCase() || '';
    const adminEmail = ADMIN_EMAIL.toLowerCase();

    if (userEmail !== adminEmail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
                <p className="text-muted-foreground max-w-md mb-6">
                    You are logged in as <span className="font-semibold text-foreground">{user.email}</span>,
                    but this account does not have administrator privileges.
                </p>

                {/* DEBUG INFO */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md text-left text-xs font-mono mb-6 w-full max-w-md overflow-auto">
                    <p><strong>Required:</strong> {ADMIN_EMAIL}</p>
                    <p><strong>Current:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Match:</strong> {userEmail === adminEmail ? 'YES' : 'NO'}</p>
                </div>

                <Button onClick={() => navigate('/')} variant="outline">
                    Return to Home
                </Button>
            </div>
        );
    }

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

                {/* Change PIN Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Security</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isChangingPin ? (
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="New PIN"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    maxLength={20}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handlePinChange} disabled={!newPin}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsChangingPin(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="text-md font-medium mb-1">Admin PIN</div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePinChangeClick}
                                >
                                    Change PIN
                                </Button>
                            </div>
                        )}
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

// Main Export with Error Boundary
export default function Admin() {
    return (
        <ErrorBoundary>
            <AdminContent />
        </ErrorBoundary>
    );
}

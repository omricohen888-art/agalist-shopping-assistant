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

// Helper to call the admin-verify Edge Function
const callAdminFunction = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(`https://${projectId}.supabase.co/functions/v1/admin-verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, ...payload }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

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
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg shadow-sm border border-destructive/20 inline-block text-left">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Something went wrong
                        </h2>
                        <p className="mb-4">The admin panel encountered an error.</p>
                        <pre className="bg-background/50 p-3 rounded text-xs font-mono overflow-auto max-w-lg border border-border">
                            {this.state.error?.toString()}
                        </pre>
                        <Button
                            variant="outline"
                            className="mt-4 w-full"
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

    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [isPinLoading, setIsPinLoading] = useState(false);
    const [announcement, setAnnouncement] = useState({ active: false, message: '', type: 'info' as 'info' | 'warning' });

    // Security Layer 1: Check Email (Normalized)
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/auth');
            }
        }
    }, [user, loading, navigate]);

    // Fetch Initial Settings & Stats once Authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
            fetchStats();
        }
    }, [isAuthenticated]);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin) return;

        setIsPinLoading(true);
        try {
            const result = await callAdminFunction('verify-pin', { pin });
            if (result.valid) {
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
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not verify PIN. Please try again.",
            });
        } finally {
            setIsPinLoading(false);
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

        try {
            await callAdminFunction('change-pin', { newValue: newPin });
            setNewPin('');
            setIsChangingPin(false);
            toast({
                title: 'Success',
                description: 'Admin PIN updated successfully.'
            });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update PIN: ' + (err.message || 'Unknown error')
            });
        }
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['maintenance_mode', 'global_announcement']);

        if (data) {
            data.forEach(setting => {
                if (setting.key === 'maintenance_mode') {
                    setMaintenanceMode(setting.value);
                } else if (setting.key === 'global_announcement') {
                    setAnnouncement(setting.value);
                }
            });
        }
        if (error) {
            console.error('[Admin] Error fetching settings:', error);
        }
    };

    const fetchStats = async () => {
        setIsLoadingStats(true);
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) {
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
        // Confirmation via prompt (no password - auth is server-side)
        const confirmed = window.confirm(
            checked
                ? "⚠️ Are you sure you want to enable maintenance mode? All non-admin users will be locked out."
                : "Re-enable the system for all users?"
        );

        if (!confirmed) return;

        setMaintenanceMode(checked);

        try {
            await callAdminFunction('toggle-maintenance', { newValue: checked });
            toast({
                title: 'Success',
                description: 'סטטוס מערכת עודכן בהצלחה',
            });
        } catch {
            setMaintenanceMode(!checked);
            toast({
                variant: "destructive",
                title: "Error",
                description: 'שגיאה בעדכון המערכת',
            });
        }
    };

    const handlePinChangeClick = () => {
        setIsChangingPin(true);
    };

    const handleAnnouncementSave = async () => {
        const { error } = await supabase
            .from('system_settings')
            .update({
                value: announcement,
                updated_at: new Date().toISOString()
            })
            .eq('key', 'global_announcement');

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update announcement: ' + error.message
            });
        } else {
            toast({
                title: 'Success',
                description: 'Global announcement updated.'
            });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user) return null;

    const userEmail = user.email?.toLowerCase() || '';
    const adminEmail = ADMIN_EMAIL.toLowerCase();

    if (userEmail !== adminEmail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
                <p className="text-muted-foreground max-w-md mb-6">
                    Your account does not have administrator access.
                </p>
                <Button onClick={() => navigate('/')} variant="outline">
                    Return to Home
                </Button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                            <Lock className="w-6 h-6 text-destructive" />
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
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={isPinLoading || !pin}>
                                {isPinLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
        <div className="min-h-screen bg-muted p-6 space-y-8 pb-32">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
                    <p className="text-muted-foreground">Manage global settings and view statistics.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono text-sm border border-primary/20">
                    v0.1.0-BETA
                </div>
            </header>

            {/* Quick Actions */}
            <section className="grid md:grid-cols-2 gap-6">
                {/* Maintenance Mode Card */}
                <Card className={`border-l-4 ${maintenanceMode ? 'border-l-destructive bg-destructive/5' : 'border-l-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">
                            System Status
                        </CardTitle>
                        <ShieldAlert className={`h-5 w-5 ${maintenanceMode ? 'text-destructive' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mt-4">
                            <div className="space-y-1">
                                <p className={`text-2xl font-bold ${maintenanceMode ? 'text-destructive' : 'text-green-600'}`}>
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
                                    type="password"
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

                {/* Global Announcement Card */}
                <Card className="md:col-span-2 border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Global Announcement</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="ann-active" className="text-xs">Active</Label>
                            <Switch
                                id="ann-active"
                                checked={announcement.active}
                                onCheckedChange={(c) => setAnnouncement(prev => ({ ...prev, active: c }))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Message</Label>
                                <Input
                                    value={announcement.message}
                                    onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Enter announcement message..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={announcement.type === 'info' ? 'default' : 'outline'}
                                        onClick={() => setAnnouncement(prev => ({ ...prev, type: 'info' }))}
                                        className="w-full"
                                    >
                                        Info (Blue)
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={announcement.type === 'warning' ? 'destructive' : 'outline'}
                                        onClick={() => setAnnouncement(prev => ({ ...prev, type: 'warning' }))}
                                        className="w-full"
                                    >
                                        Warning (Yellow)
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleAnnouncementSave} variant="secondary">Save Announcement</Button>
                        </div>
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
                                            <span className="text-xs text-muted-foreground">User</span>
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

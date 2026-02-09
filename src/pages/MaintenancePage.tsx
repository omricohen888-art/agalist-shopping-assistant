import { ShieldAlert } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 text-center space-y-6 fixed inset-0 z-50">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <ShieldAlert className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                    System Upgrade in Progress
                </h1>
                <h2 className="text-xl font-medium text-neutral-600 dark:text-neutral-400 font-hebrew text-right" dir="rtl">
                    משדרגים את המערכת...
                </h2>
                <p className="text-muted-foreground pt-2">
                    We are currently performing scheduled maintenance to improve your experience.
                    Please check back in a few minutes.
                </p>
            </div>
            <div className="pt-8 text-xs text-muted-foreground/50 font-mono">
                System ID: {new Date().getTime().toString(36)}
            </div>
        </div>
    );
}

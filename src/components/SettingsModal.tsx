import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Volume2, VolumeX, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useGlobalLanguage } from "@/context/LanguageContext";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { translations } from "@/utils/translations";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useGlobalLanguage();
  const { settings, setMuted, setVolume, playSound } = useSoundSettings();
  const { deleteAllData } = useCloudSync();
  const { user } = useAuth();
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const t = translations[language];

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleTestSound = () => {
    playSound(600, 0.15);
  };

  // Delete All handlers
  const handleDeleteAllFromDevice = async () => {
    const success = await deleteAllData(false);
    if (success) {
      setIsDeleteAllDialogOpen(false);
      onOpenChange(false); // Close settings dialog
      toast.success(language === 'he' ? 'כל הרשימות וההיסטוריה נמחקו מהמכשיר' : 'All lists and history cleared from device.');
      // Force page reload to reset all states
      window.location.reload();
    } else {
      toast.error(language === 'he' ? 'שגיאה במחיקת הנתונים' : 'Error deleting data');
    }
  };

  const handleDeleteAllEverywhere = async () => {
    const success = await deleteAllData(true);
    if (success) {
      setIsDeleteAllDialogOpen(false);
      onOpenChange(false); // Close settings dialog
      toast.success(language === 'he' ? 'כל הרשימות וההיסטוריה נמחקו מהענן והמכשיר' : 'All lists and history cleared everywhere.');
      // Force page reload to reset all states
      window.location.reload();
    } else {
      toast.error(language === 'he' ? 'שגיאה במחיקת הנתונים' : 'Error deleting data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {language === 'he' ? 'הגדרות מערכת' : 'System Settings'}
          </DialogTitle>
          <DialogDescription>
            {language === 'he' ? 'התאם את האפליקציה לחוויה האישית שלך' : 'Customize the app to your personal experience'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'he' ? 'מראה' : 'Appearance'}
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                {language === 'he' ? 'מצב לילה' : 'Dark Mode'}
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>

          <Separator />

          {/* Sound Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'he' ? 'צלילים' : 'Sound'}
            </h3>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-mute" className="text-sm font-medium flex items-center gap-2">
                {settings.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {language === 'he' ? 'צלילי מערכת' : 'System Sounds'}
              </Label>
              <Switch
                id="sound-mute"
                checked={!settings.isMuted}
                onCheckedChange={(checked) => setMuted(!checked)}
              />
            </div>

            {/* Volume Slider */}
            {!settings.isMuted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume" className="text-sm font-medium">
                    {language === 'he' ? 'עוצמה' : 'Volume'}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <Slider
                  id="volume"
                  value={[settings.volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <button
                  onClick={handleTestSound}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {language === 'he' ? 'בדוק צליל' : 'Test Sound'}
                </button>
              </div>
            )}
          </div>

          <Separator />

          {/* Data Management / Danger Zone Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-destructive">
              {language === 'he' ? 'ניהול נתונים' : 'Data Management'}
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'פעולות מסוכנות - לא ניתן לבטל' 
                  : 'Danger zone - actions cannot be undone'}
              </p>
              
              <Button
                variant="destructive"
                onClick={() => setIsDeleteAllDialogOpen(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'he' ? 'מחק את כל הרשימות' : 'Delete All Lists'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {language === 'he' ? '⚠️ אזהרה: מחיקת כל הנתונים' : '⚠️ Warning: Delete All Data'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block font-medium text-foreground">
                {language === 'he' 
                  ? 'פעולה זו תמחק לצמיתות:' 
                  : 'This will permanently delete:'}
              </span>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{language === 'he' ? 'כל הרשימות השמורות' : 'All saved lists'}</li>
                <li>{language === 'he' ? 'כל הרשימות בתהליך' : 'All in-progress lists'}</li>
                <li>{language === 'he' ? 'כל היסטוריית הקניות' : 'All shopping history'}</li>
              </ul>
              <span className="block text-destructive font-semibold mt-2">
                {language === 'he' 
                  ? 'פעולה זו לא ניתנת לביטול!' 
                  : 'This action cannot be undone!'}
              </span>
              {user && (
                <span className="block mt-2 text-muted-foreground text-sm">
                  {language === 'he' 
                    ? 'בחר "מחק מכל מקום" כדי למחוק גם מהחשבון בענן.' 
                    : 'Choose "Delete Everywhere" to also delete from your cloud account.'}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            {user ? (
              <>
                <AlertDialogAction
                  onClick={handleDeleteAllFromDevice}
                  className="bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  {language === 'he' ? 'מחק מהמכשיר בלבד' : 'Delete from Device Only'}
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={handleDeleteAllEverywhere}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {language === 'he' ? 'מחק מכל מקום' : 'Delete Everywhere'}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction
                onClick={handleDeleteAllFromDevice}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {language === 'he' ? 'מחק' : 'Delete'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Volume2, VolumeX } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/use-language";
import { useSoundSettings } from "@/hooks/use-sound-settings.tsx";
import { translations } from "@/utils/translations";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { settings, setMuted, setVolume, playSound } = useSoundSettings();
  const t = translations[language];

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleTestSound = () => {
    playSound(600, 0.15);
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

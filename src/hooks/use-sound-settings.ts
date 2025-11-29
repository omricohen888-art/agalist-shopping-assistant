import { createContext, useContext, useState, useEffect } from 'react';

interface SoundSettings {
  isMuted: boolean;
  volume: number; // 0 to 1
}

interface SoundSettingsContextType {
  settings: SoundSettings;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (frequency?: number, duration?: number) => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const SOUND_SETTINGS_KEY = 'sound-settings';

const defaultSettings: SoundSettings = {
  isMuted: false,
  volume: 0.5,
};

export const useSoundSettings = () => {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error('useSoundSettings must be used within a SoundSettingsProvider');
  }
  return context;
};

export const SoundSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    try {
      const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const setMuted = (isMuted: boolean) => {
    setSettings(prev => ({ ...prev, isMuted }));
  };

  const setVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  const playSound = (frequency: number = 800, duration: number = 0.1) => {
    if (settings.isMuted) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.4, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(settings.volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  return (
    <SoundSettingsContext.Provider value={{ settings, setMuted, setVolume, playSound }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};


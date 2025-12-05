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
  playFeedback: (type: 'click' | 'success' | 'error' | 'warning' | 'info') => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const SOUND_SETTINGS_KEY = 'sound-settings';

const defaultSettings: SoundSettings = {
  isMuted: false,
  volume: 0.15, // Reduced from 0.5 for subtler audio
};

// Preset sound profiles with optimized frequencies and durations
const SOUND_PROFILES = {
  click: { frequencies: [800], duration: 0.06 },
  success: { frequencies: [523, 659, 784], duration: 0.2 }, // C major chord for pleasant success
  error: { frequencies: [330, 294], duration: 0.15 },
  warning: { frequencies: [440], duration: 0.1 },
  info: { frequencies: [600], duration: 0.08 },
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

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.7, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.volume * 0.15, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const playChord = (frequencies: number[], duration: number) => {
    if (settings.isMuted) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Stagger the notes slightly for arpeggio effect
        const startDelay = index * 0.03;
        const noteVolume = settings.volume * 0.1 / frequencies.length;

        gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
        gainNode.gain.linearRampToValueAtTime(noteVolume, ctx.currentTime + startDelay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

        oscillator.start(ctx.currentTime + startDelay);
        oscillator.stop(ctx.currentTime + startDelay + duration);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const playFeedback = (type: 'click' | 'success' | 'error' | 'warning' | 'info') => {
    const profile = SOUND_PROFILES[type];
    if (profile.frequencies.length > 1) {
      playChord(profile.frequencies, profile.duration);
    } else {
      playSound(profile.frequencies[0], profile.duration);
    }
  };

  return (
    <SoundSettingsContext.Provider value={{ settings, setMuted, setVolume, playSound, playFeedback }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

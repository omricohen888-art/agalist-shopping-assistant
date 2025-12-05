export const useHaptics = () => {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently fail if vibration not supported
      }
    }
  };

  const lightTap = () => vibrate(10);
  const mediumTap = () => vibrate(20);
  const heavyTap = () => vibrate(30);
  const successPattern = () => vibrate([15, 50, 25]);
  const errorPattern = () => vibrate([50, 30, 50]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    successPattern,
    errorPattern,
  };
};

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocityX: number;
  velocityY: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  origin?: { x: number; y: number };
}

const COLORS = [
  'hsl(152, 69%, 46%)',  // success
  'hsl(47, 96%, 53%)',   // primary/gold
  'hsl(200, 80%, 60%)',  // sky blue
  'hsl(320, 70%, 60%)',  // pink
  'hsl(280, 70%, 60%)',  // purple
];

export const ConfettiEffect = ({ isActive, origin = { x: 50, y: 50 } }: ConfettiEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: origin.x,
        y: origin.y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocityX: (Math.random() - 0.5) * 120,
        velocityY: -40 - Math.random() * 60,
      });
    }
    setParticles(newParticles);

    const timeout = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timeout);
  }, [isActive, origin.x, origin.y]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            '--velocity-x': `${particle.velocityX}px`,
            '--velocity-y': `${particle.velocityY}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

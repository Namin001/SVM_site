'use client';
import { useEffect, useState } from 'react';

export function PebblesBackground() {
  const [pebbles, setPebbles] = useState<any[]>([]);

  useEffect(() => {
    // Generate random pebbles
    const newPebbles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 120 + 40}px`,
      height: `${Math.random() * 80 + 30}px`,
      animationDuration: `${Math.random() * 25 + 15}s`,
      animationDelay: `${Math.random() * -20}s`, // Negative delay so they start immediately at different points
      opacity: Math.random() * 0.08 + 0.02,
      rotation: Math.random() * 360
    }));
    setPebbles(newPebbles);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {pebbles.map(pebble => (
        <div
          key={pebble.id}
          style={{
            position: 'absolute',
            left: pebble.left,
            top: pebble.top,
            width: pebble.width,
            height: pebble.height,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            opacity: pebble.opacity,
            animation: `pebbleFloat ${pebble.animationDuration} infinite alternate ease-in-out`,
            animationDelay: pebble.animationDelay,
            filter: 'blur(4px)',
            transform: `rotate(${pebble.rotation}deg)`
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pebbleFloat {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(1); 
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; 
          }
          33% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
            transform: translate(30px, -50px) rotate(15deg) scale(1.05);
          }
          66% { 
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
            transform: translate(-20px, 40px) rotate(-10deg) scale(0.95);
          }
          100% { 
            transform: translate(50px, 50px) rotate(45deg) scale(1.1); 
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; 
          }
        }
      `}} />
    </div>
  );
}

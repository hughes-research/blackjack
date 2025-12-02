'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * Floating particles background effect.
 * Uses client-only rendering to avoid hydration mismatches from Math.random().
 */
export default function FloatingParticles() {
  // Generate particle data only on the client
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      background: i % 3 === 0 ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.1)',
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: particle.background,
            left: particle.left,
          }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}




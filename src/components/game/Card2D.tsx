'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Card2DProps {
  frontImage: string;
  backImage?: string;
  faceUp: boolean;
  index: number;
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dealDelay?: number;
}

// Responsive card sizes - smaller on mobile, larger on desktop
const sizeClasses = {
  sm: 'w-12 h-[72px] sm:w-14 sm:h-20 md:w-16 md:h-24',
  md: 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36',
  lg: 'w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-44',
};

/**
 * Stunning 2D card component with flip animation and visual effects.
 */
export function Card2D({
  frontImage,
  backImage = '/cards/back.svg',
  faceUp,
  index,
  highlighted = false,
  size = 'md',
  dealDelay = 0,
}: Card2DProps) {
  const [isDealt, setIsDealt] = useState(false);
  const [showFront, setShowFront] = useState(faceUp);

  useEffect(() => {
    const dealTimer = setTimeout(() => setIsDealt(true), dealDelay);
    return () => clearTimeout(dealTimer);
  }, [dealDelay]);

  useEffect(() => {
    if (isDealt) {
      const flipTimer = setTimeout(() => setShowFront(faceUp), 150);
      return () => clearTimeout(flipTimer);
    }
  }, [faceUp, isDealt]);

  return (
    <AnimatePresence>
      {isDealt && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: -100, 
            x: 50,
            rotateZ: -15,
            scale: 0.5 
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            x: index * -12,
            rotateZ: 0,
            scale: 1 
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 25,
            delay: index * 0.1,
          }}
          className={`
            relative ${sizeClasses[size]} 
            preserve-3d cursor-pointer
            ${highlighted ? 'z-10' : ''}
          `}
          style={{
            perspective: '1000px',
            marginLeft: index > 0 ? '-0.75rem' : 0,
          }}
        >
          {/* Card container with flip effect */}
          <motion.div
            className="relative w-full h-full preserve-3d"
            animate={{ rotateY: showFront ? 0 : 180 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front face */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className={`
                relative w-full h-full rounded-lg bg-white
                ${highlighted ? 'ring-2 ring-gold shadow-[0_0_20px_rgba(212,175,55,0.6)]' : 'shadow-xl'}
              `}>
                <Image
                  src={frontImage}
                  alt="Card"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 80px, 96px"
                />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-lg" />
              </div>
            </div>
            
            {/* Back face */}
            <div 
              className="absolute inset-0 backface-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className={`
                relative w-full h-full rounded-lg shadow-xl
                ${highlighted ? 'ring-2 ring-gold shadow-[0_0_20px_rgba(212,175,55,0.6)]' : ''}
              `}>
                <Image
                  src={backImage}
                  alt="Card back"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 80px, 96px"
                />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-lg" />
              </div>
            </div>
          </motion.div>
          
          {/* Glow effect for highlighted cards */}
          {highlighted && (
            <motion.div
              className="absolute -inset-2 rounded-xl bg-gold/20 blur-xl -z-10"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hand display component showing multiple cards.
 */
interface HandDisplayProps {
  cards: Array<{
    id: string;
    imagePath: string;
    faceUp: boolean;
  }>;
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dealDelay?: number;
}

export function HandDisplay({ 
  cards, 
  highlighted = false, 
  size = 'md',
  dealDelay = 0 
}: HandDisplayProps) {
  return (
    <div className="flex items-center justify-center">
      {cards.map((card, index) => (
        <Card2D
          key={card.id}
          frontImage={card.imagePath}
          faceUp={card.faceUp}
          index={index}
          highlighted={highlighted && index === cards.length - 1}
          size={size}
          dealDelay={dealDelay + index * 200}
        />
      ))}
    </div>
  );
}




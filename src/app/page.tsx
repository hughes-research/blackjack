'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, Play, Sparkles, Crown, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Animated counter component for visual flair.
 */
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(count, value, { duration });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue.toLocaleString()}</span>;
}

/**
 * Floating particle effect - client-only component.
 */
function ParticleFieldInner() {
  const [particles] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      background: i % 4 === 0 
        ? 'rgba(212, 175, 55, 0.6)' 
        : i % 4 === 1 
          ? 'rgba(255, 215, 0, 0.4)'
          : 'rgba(255, 255, 255, 0.2)',
      left: Math.random() * 100,
      top: Math.random() * 100,
      xOffset: Math.random() * 20 - 10,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: particle.width,
            height: particle.height,
            background: particle.background,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Dynamic import with SSR disabled to prevent hydration mismatch
const ParticleField = dynamic(() => Promise.resolve(ParticleFieldInner), {
  ssr: false,
  loading: () => <div className="absolute inset-0 overflow-hidden pointer-events-none" />,
});

/**
 * Animated card stack for the hero section.
 */
function HeroCardStack() {
  const cardVariants = {
    hidden: { opacity: 0, y: -100, rotateZ: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateZ: (i - 2) * 15,
      scale: 1,
      x: (i - 2) * 30,
      transition: {
        delay: 0.8 + i * 0.15,
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
      },
    }),
    hover: (i: number) => ({
      y: -20,
      rotateZ: (i - 2) * 12,
      scale: 1.05,
      transition: { duration: 0.3 },
    }),
  };

  return (
    <motion.div
      className="relative w-96 h-56 flex items-center justify-center"
      whileHover="hover"
    >
      {/* Glow effect behind cards */}
      <motion.div
        className="absolute w-64 h-32 bg-gold/30 rounded-full blur-3xl"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="absolute w-28 h-40 rounded-xl overflow-hidden cursor-pointer"
          style={{
            transformOrigin: 'bottom center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.2)',
            border: '2px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <Image
            src="/cards/back.svg"
            alt="Card back"
            fill
            className="object-cover"
          />
          {/* Card shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Luxury decorative frame corners.
 */
function LuxuryFrame() {
  return (
    <>
      {/* Top left */}
      <div className="absolute top-6 left-6 w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 215, 0, 0.6)" />
              <stop offset="100%" stopColor="rgba(212, 175, 55, 0.3)" />
            </linearGradient>
          </defs>
          <path d="M0 30 L0 0 L30 0" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
          <path d="M10 20 L10 10 L20 10" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
          <circle cx="5" cy="5" r="2" fill="rgba(255, 215, 0, 0.5)" />
        </svg>
      </div>
      
      {/* Top right */}
      <div className="absolute top-6 right-6 w-24 h-24 -scale-x-100">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 30 L0 0 L30 0" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
          <path d="M10 20 L10 10 L20 10" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
          <circle cx="5" cy="5" r="2" fill="rgba(255, 215, 0, 0.5)" />
        </svg>
      </div>
      
      {/* Bottom left */}
      <div className="absolute bottom-6 left-6 w-24 h-24 -scale-y-100">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 30 L0 0 L30 0" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
          <path d="M10 20 L10 10 L20 10" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
          <circle cx="5" cy="5" r="2" fill="rgba(255, 215, 0, 0.5)" />
        </svg>
      </div>
      
      {/* Bottom right */}
      <div className="absolute bottom-6 right-6 w-24 h-24 scale-x-[-1] scale-y-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 30 L0 0 L30 0" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
          <path d="M10 20 L10 10 L20 10" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
          <circle cx="5" cy="5" r="2" fill="rgba(255, 215, 0, 0.5)" />
        </svg>
      </div>
    </>
  );
}

/**
 * Intro/Landing screen for the blackjack game.
 */
export default function IntroScreen() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-rich-black">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/58471.jpg"
          alt="Casino felt background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
      </div>
      
      {/* Particle effects */}
      <ParticleField />
      
      {/* Luxury frame */}
      <LuxuryFrame />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Crown decoration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-gold/60" />
            </motion.div>
            <Crown className="w-8 h-8 text-gold" />
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-gold/60" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gold/70 text-sm uppercase mb-4 font-body tracking-widest"
          >
            Welcome to
          </motion.p>
          
          {/* Main Title with glow */}
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 blur-2xl"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-gold/30">
                BLACKJACK
              </h1>
            </motion.div>
            
            {/* Main text */}
            <h1 className="relative font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
              <span className="bg-gradient-to-b from-gold-light via-gold to-gold-dark bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(212,175,55,0.5)]">
                BLACKJACK
              </span>
            </h1>
          </div>
          
          {/* Decorative Line with Subtitle */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            />
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-gold text-xl tracking-[0.4em] font-display uppercase flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Royale
              <Zap className="w-4 h-4" />
            </motion.span>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            />
          </div>
        </motion.div>
        
        {/* Card Stack Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <HeroCardStack />
        </motion.div>
        
        {/* Stats teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex items-center gap-8 mb-10"
        >
          <div className="text-center">
            <div className="text-gold font-display text-2xl font-bold">
              <AnimatedNumber value={21} />
            </div>
            <div className="text-gold/50 text-xs uppercase tracking-wider">Target</div>
          </div>
          <div className="w-px h-8 bg-gold/20" />
          <div className="text-center">
            <div className="text-gold font-display text-2xl font-bold">3:2</div>
            <div className="text-gold/50 text-xs uppercase tracking-wider">Blackjack Pays</div>
          </div>
          <div className="w-px h-8 bg-gold/20" />
          <div className="text-center">
            <div className="text-gold font-display text-2xl font-bold">$1000</div>
            <div className="text-gold/50 text-xs uppercase tracking-wider">Starting Chips</div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          {/* Play Button - Premium style */}
          <Link href="/game" className="w-full group">
            <motion.button
              className="relative w-full py-5 px-8 overflow-hidden rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-dark"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              {/* Border glow */}
              <div className="absolute inset-0 rounded-xl border-2 border-gold-shine shadow-[0_0_40px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]" />
              
              {/* Content */}
              <span className="relative flex items-center justify-center gap-3">
                <Play className="w-6 h-6 fill-current text-rich-black" />
                <span className="font-display text-xl font-bold tracking-widest text-rich-black">
                  PLAY NOW
                </span>
              </span>
            </motion.button>
          </Link>
          
          {/* Settings Button */}
          <Link href="/settings" className="w-full">
            <motion.button
              className="w-full py-4 px-8 bg-transparent text-gold border-2 border-gold/40 font-display text-lg tracking-wider rounded-xl hover:bg-gold/10 hover:border-gold transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center gap-3">
                <Settings className="w-5 h-5" />
                Settings
              </span>
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Suit Symbols Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 flex items-center gap-8 text-3xl"
        >
          {['spades', 'hearts', 'diamonds', 'clubs'].map((suit, i) => (
            <motion.span
              key={suit}
              className={`cursor-default transition-all duration-300 ${
                suit === 'hearts' || suit === 'diamonds' 
                  ? 'text-red-500/40 hover:text-red-500' 
                  : 'text-gold/40 hover:text-gold'
              }`}
              whileHover={{ scale: 1.3, y: -5 }}
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                y: { duration: 2, repeat: Infinity, delay: i * 0.2 },
              }}
            >
              {suit === 'spades' && '♠'}
              {suit === 'hearts' && '♥'}
              {suit === 'diamonds' && '♦'}
              {suit === 'clubs' && '♣'}
            </motion.span>
          ))}
        </motion.div>
        
        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="absolute bottom-3 text-gold/20 text-xs tracking-widest font-body"
        >
          v1.0.0 - World Class Edition
        </motion.p>
      </div>
    </main>
  );
}

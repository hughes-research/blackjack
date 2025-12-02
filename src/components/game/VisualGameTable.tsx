'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { HandDisplay } from './Card2D';
import { Player, Dealer, GamePhase } from '@/types/game';
import { formatScore } from '@/lib/blackjack';
import { Crown, User, Bot, Sparkles } from 'lucide-react';

interface VisualGameTableProps {
  players: Player[];
  dealer: Dealer;
  currentPlayerIndex: number;
  phase: GamePhase;
}

/**
 * Particle effect component for visual flair.
 * Uses client-only rendering to avoid hydration mismatches from Math.random().
 */
function ParticleEffect() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Generate particle data only on the client
  const particles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + '%',
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gold/30 rounded-full"
          initial={{
            x: particle.x,
            y: '100%',
            opacity: 0,
          }}
          animate={{
            y: '-20%',
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

/**
 * Decorative corner ornaments.
 */
function CornerOrnaments() {
  return (
    <>
      <div className="absolute top-4 left-4 w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold/20">
          <path d="M0 0 L0 100 M0 0 L100 0" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10 10 L10 40 M10 10 L40 10" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 -scale-x-100">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold/20">
          <path d="M0 0 L0 100 M0 0 L100 0" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10 10 L10 40 M10 10 L40 10" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="10" cy="10" r="3" fill="currentColor" />
        </svg>
      </div>
    </>
  );
}

/**
 * Player position component with visual effects.
 */
interface PlayerPositionProps {
  player: Player;
  isActive: boolean;
  position: 'left' | 'center' | 'right';
  phase: GamePhase;
}

function PlayerPosition({ player, isActive, position, phase }: PlayerPositionProps) {
  const hand = player.hands[player.activeHandIndex];
  const hasCards = hand.cards.length > 0;
  
  // Responsive positioning - AI players higher up on mobile
  // User always at bottom center with more space
  const positionStyles = {
    left: 'left-1 sm:left-4 md:left-8 bottom-[55%] sm:bottom-40 md:bottom-36',
    center: 'left-1/2 -translate-x-1/2 bottom-36 sm:bottom-32 md:bottom-36',
    right: 'right-1 sm:right-4 md:right-8 bottom-[55%] sm:bottom-40 md:bottom-36',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute ${positionStyles[position]}`}
    >
      {/* Active player glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-8 rounded-3xl bg-gradient-to-t from-gold/20 via-gold/5 to-transparent blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className={`
        relative flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl
        ${isActive 
          ? 'bg-gradient-to-t from-gold/20 via-black/40 to-black/20 border border-gold/40' 
          : 'bg-black/30 border border-gold/10'
        }
        backdrop-blur-sm transition-all duration-300
      `}>
        {/* Player info */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {player.type === 'user' ? (
            <div className="p-1 sm:p-1.5 rounded-full bg-gold/20">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
            </div>
          ) : (
            <div className="p-1 sm:p-1.5 rounded-full bg-casino-green-dark/50">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-gold/60" />
            </div>
          )}
          <span className={`font-display font-semibold text-sm sm:text-base ${player.type === 'user' ? 'text-gold' : 'text-cream/80'}`}>
            {player.name}
          </span>
          {isActive && phase === 'playing' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
            </motion.div>
          )}
        </div>
        
        {/* Cards */}
        <div className="min-h-[100px] sm:min-h-[120px] md:min-h-[150px] flex items-center justify-center">
          {hasCards ? (
            <HandDisplay
              cards={hand.cards}
              highlighted={isActive}
              size="md"
              dealDelay={0}
            />
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-gold/20 flex items-center justify-center">
              <span className="text-gold/30 text-xs">No cards</span>
            </div>
          )}
        </div>
        
        {/* Score */}
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              px-4 py-1.5 rounded-full font-display font-bold text-lg
              ${hand.isBlackjack 
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-rich-black animate-pulse' 
                : hand.isBusted 
                  ? 'bg-red-900/50 text-red-400 border border-red-700/50' 
                  : isActive
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'bg-black/30 text-cream/80'
              }
            `}
          >
            {formatScore(hand)}
          </motion.div>
        )}
        
        {/* Bet display */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-cream/50">Bet:</span>
            <span className="text-gold font-semibold">${player.bets.reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="w-px h-3 bg-gold/20" />
          <div className="flex items-center gap-1">
            <span className="text-cream/50">Chips:</span>
            <span className="text-cream/80">${player.chips}</span>
          </div>
        </div>
        
        {/* Result badge */}
        {phase === 'round-end' && player.results[0] !== 'pending' && (
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            className={`
              absolute -top-3 left-1/2 -translate-x-1/2
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${player.results[0] === 'win' || player.results[0] === 'blackjack'
                ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                : player.results[0] === 'lose'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-black'
              }
            `}
          >
            {player.results[0] === 'blackjack' ? 'BLACKJACK!' : player.results[0].toUpperCase()}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Dealer position component.
 */
interface DealerPositionProps {
  dealer: Dealer;
  isActive: boolean;
  phase: GamePhase;
}

function DealerPosition({ dealer, isActive, phase }: DealerPositionProps) {
  const hasCards = dealer.hand.cards.length > 0;
  
  // Calculate visible score
  const visibleScore = dealer.holeCardRevealed
    ? formatScore(dealer.hand)
    : hasCards
      ? dealer.hand.cards[0].faceUp
        ? `${dealer.hand.cards[0].value}${dealer.hand.cards.length > 1 ? ' + ?' : ''}`
        : '?'
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 sm:top-4 md:top-8 left-1/2 -translate-x-1/2"
    >
      {/* Dealer glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-4 sm:-inset-6 md:-inset-8 rounded-3xl bg-gradient-to-b from-gold/20 via-gold/5 to-transparent blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className={`
        relative flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl
        ${isActive 
          ? 'bg-gradient-to-b from-gold/20 via-black/40 to-black/20 border border-gold/40' 
          : 'bg-black/30 border border-gold/10'
        }
        backdrop-blur-sm
      `}>
        {/* Dealer label */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-full bg-gold/30">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
          </div>
          <span className="font-display font-bold text-gold text-base sm:text-lg">DEALER</span>
          {isActive && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gold/60 text-sm"
            >
              Drawing...
            </motion.span>
          )}
        </div>
        
        {/* Cards */}
        <div className="min-h-[100px] sm:min-h-[120px] md:min-h-[150px] flex items-center justify-center">
          {hasCards ? (
            <div className="flex items-center">
              {dealer.hand.cards.map((card, index) => {
                const isHoleCard = index === 1;
                const showFaceUp = isHoleCard ? dealer.holeCardRevealed : card.faceUp;
                
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: -50, rotate: -10 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: index * 0.3, type: 'spring' }}
                    className="relative"
                    style={{ marginLeft: index > 0 ? '-0.75rem' : 0 }}
                  >
                    <div className={`
                      relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg shadow-xl bg-white
                      ${isActive && index === dealer.hand.cards.length - 1 ? 'ring-2 ring-gold shadow-[0_0_20px_rgba(212,175,55,0.6)]' : ''}
                    `}>
                      <motion.div
                        className="relative w-full h-full"
                        animate={{ rotateY: showFaceUp ? 0 : 180 }}
                        transition={{ duration: 0.4 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front */}
                        <div 
                          className="absolute inset-0"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <Image
                            src={card.imagePath}
                            alt="Card"
                            fill
                            className="object-contain rounded-lg"
                            sizes="96px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-lg" />
                        </div>
                        {/* Back */}
                        <div 
                          className="absolute inset-0"
                          style={{ 
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <Image
                            src="/cards/back.svg"
                            alt="Card back"
                            fill
                            className="object-contain rounded-lg"
                            sizes="96px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-gold/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-gold/20" />
            </div>
          )}
        </div>
        
        {/* Score */}
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              px-4 py-1.5 rounded-full font-display font-bold text-lg
              ${dealer.hand.isBlackjack && dealer.holeCardRevealed
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-rich-black animate-pulse' 
                : dealer.hand.isBusted 
                  ? 'bg-red-900/50 text-red-400 border border-red-700/50' 
                  : 'bg-black/30 text-cream/80 border border-gold/20'
              }
            `}
          >
            {visibleScore}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Main visual game table component.
 */
export function VisualGameTable({ players, dealer, currentPlayerIndex, phase }: VisualGameTableProps) {
  const positions: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
  
  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Ambient effects */}
      <ParticleEffect />
      <CornerOrnaments />
      
      {/* Central table area with glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full bg-gradient-radial from-gold/5 via-transparent to-transparent blur-3xl" />
      </div>
      
      {/* Semi-circle decoration */}
      <svg 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        viewBox="0 0 700 400"
      >
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
            <stop offset="50%" stopColor="rgba(212, 175, 55, 0.3)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M 50 350 Q 350 50 650 350"
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
      </svg>
      
      {/* Dealer position */}
      <DealerPosition
        dealer={dealer}
        isActive={phase === 'dealer-turn'}
        phase={phase}
      />
      
      {/* Player positions */}
      {players.map((player, index) => (
        <PlayerPosition
          key={player.id}
          player={player}
          isActive={phase === 'playing' && currentPlayerIndex === index}
          position={positions[player.position]}
          phase={phase}
        />
      ))}
      
      {/* Center logo/branding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="text-gold/10 font-display text-4xl font-black tracking-wider">
            BLACKJACK
          </div>
          <div className="text-gold/5 text-xs tracking-[0.5em] uppercase mt-1">
            Royale
          </div>
        </motion.div>
      </div>
    </div>
  );
}


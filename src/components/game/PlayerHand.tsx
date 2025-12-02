'use client';

import { motion } from 'framer-motion';
import { Player, RoundResult } from '@/types/game';
import { formatScore } from '@/lib/blackjack';
import { User, Bot, Crown, Coins } from 'lucide-react';

interface PlayerHandProps {
  player: Player;
  isCurrentTurn: boolean;
  showResult?: boolean;
}

/**
 * Result badge component.
 */
function ResultBadge({ result }: { result: RoundResult }) {
  const resultConfig: Record<RoundResult, { text: string; color: string; bg: string }> = {
    win: { text: 'WIN', color: 'text-green-400', bg: 'bg-green-900/50' },
    lose: { text: 'LOSE', color: 'text-red-400', bg: 'bg-red-900/50' },
    push: { text: 'PUSH', color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
    blackjack: { text: 'BLACKJACK!', color: 'text-gold', bg: 'bg-gold/20' },
    surrender: { text: 'SURRENDER', color: 'text-orange-400', bg: 'bg-orange-900/50' },
    pending: { text: '', color: '', bg: '' },
  };
  
  const config = resultConfig[result];
  if (result === 'pending') return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded ${config.bg} ${config.color} text-xs font-bold tracking-wider whitespace-nowrap`}
    >
      {config.text}
    </motion.div>
  );
}

/**
 * Player hand display component.
 * Shows player info, score, and bet amount.
 */
export function PlayerHandDisplay({ player, isCurrentTurn, showResult = false }: PlayerHandProps) {
  const activeHand = player.hands[player.activeHandIndex];
  const hasMultipleHands = player.hands.length > 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-lg
        ${isCurrentTurn 
          ? 'bg-gold/10 border-2 border-gold shadow-gold-glow' 
          : 'bg-black/30 border border-gold/20'
        }
        transition-all duration-300
      `}
    >
      {/* Result Badge */}
      {showResult && player.results[player.activeHandIndex] !== 'pending' && (
        <ResultBadge result={player.results[player.activeHandIndex]} />
      )}
      
      {/* Player Icon and Name */}
      <div className="flex items-center gap-2">
        {player.type === 'user' ? (
          <User className="w-4 h-4 text-gold" />
        ) : (
          <Bot className="w-4 h-4 text-gold/60" />
        )}
        <span className={`font-display text-sm ${player.type === 'user' ? 'text-gold' : 'text-cream/70'}`}>
          {player.name}
        </span>
        {isCurrentTurn && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gold text-xs"
          >
            (Your Turn)
          </motion.span>
        )}
      </div>
      
      {/* Hand Scores */}
      <div className="flex items-center gap-3">
        {player.hands.map((hand, index) => (
          <div
            key={index}
            className={`
              px-3 py-1 rounded
              ${index === player.activeHandIndex && hasMultipleHands
                ? 'bg-gold/20 border border-gold/40'
                : hasMultipleHands ? 'bg-black/20' : ''
              }
            `}
          >
            <span className={`
              font-display text-lg font-bold
              ${hand.isBlackjack ? 'text-gold animate-shimmer' : ''}
              ${hand.isBusted ? 'text-red-400' : 'text-cream'}
            `}>
              {formatScore(hand)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Bet and Chips */}
      <div className="flex items-center gap-4 text-sm">
        {/* Current Bet */}
        <div className="flex items-center gap-1">
          <span className="text-cream/50">Bet:</span>
          <span className="text-gold font-semibold">
            ${player.bets.reduce((sum, bet) => sum + bet, 0)}
          </span>
        </div>
        
        {/* Chips */}
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-gold/60" />
          <span className="text-cream/60">${player.chips}</span>
        </div>
      </div>
      
      {/* Insurance indicator */}
      {player.hasInsurance && (
        <div className="text-xs text-yellow-400/70">
          Insurance: ${player.insuranceBet}
        </div>
      )}
      
      {/* Split hands indicator */}
      {hasMultipleHands && (
        <div className="text-xs text-cream/40">
          Hand {player.activeHandIndex + 1} of {player.hands.length}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Compact player info for the table overlay.
 */
interface PlayerLabelProps {
  player: Player;
  position: 'left' | 'center' | 'right';
  isCurrentTurn: boolean;
}

export function PlayerLabel({ player, position, isCurrentTurn }: PlayerLabelProps) {
  const positionClasses = {
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        absolute bottom-4 ${positionClasses[position]}
        flex flex-col items-center gap-1
      `}
    >
      <div className={`
        px-3 py-1 rounded-full text-xs font-display
        ${isCurrentTurn 
          ? 'bg-gold text-rich-black font-bold' 
          : 'bg-black/50 text-cream/70'
        }
      `}>
        {player.name}
      </div>
      
      {player.hands[0].cards.length > 0 && (
        <div className={`
          text-sm font-bold
          ${player.hands[0].isBlackjack ? 'text-gold' : ''}
          ${player.hands[0].isBusted ? 'text-red-400' : 'text-cream'}
        `}>
          {formatScore(player.hands[0])}
        </div>
      )}
    </motion.div>
  );
}




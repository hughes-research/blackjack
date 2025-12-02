'use client';

import { motion } from 'framer-motion';
import { Dealer } from '@/types/game';
import { formatScore } from '@/lib/blackjack';
import { Crown } from 'lucide-react';

interface DealerHandProps {
  dealer: Dealer;
  isActive: boolean;
  showResult?: boolean;
}

/**
 * Dealer hand display component.
 * Shows dealer cards and score.
 */
export function DealerHandDisplay({ dealer, isActive, showResult = false }: DealerHandProps) {
  // Calculate visible score (only count face-up cards if hole card not revealed)
  const visibleScore = dealer.holeCardRevealed
    ? formatScore(dealer.hand)
    : dealer.hand.cards.length > 0
      ? dealer.hand.cards[0].faceUp
        ? dealer.hand.cards[0].value.toString()
        : '?'
      : '0';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-lg
        ${isActive 
          ? 'bg-gold/10 border-2 border-gold shadow-gold-glow' 
          : 'bg-black/30 border border-gold/20'
        }
        transition-all duration-300
      `}
    >
      {/* Dealer Label */}
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-gold" />
        <span className="font-display text-sm text-gold">Dealer</span>
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gold/60 text-xs"
          >
            (Drawing)
          </motion.span>
        )}
      </div>
      
      {/* Score Display */}
      <div className="flex items-center gap-2">
        <span className={`
          font-display text-2xl font-bold
          ${dealer.hand.isBlackjack ? 'text-gold animate-shimmer' : ''}
          ${dealer.hand.isBusted ? 'text-red-400' : 'text-cream'}
        `}>
          {dealer.holeCardRevealed ? formatScore(dealer.hand) : visibleScore}
        </span>
        
        {!dealer.holeCardRevealed && dealer.hand.cards.length > 1 && (
          <span className="text-cream/40 text-sm">+ ?</span>
        )}
      </div>
      
      {/* Result indicators */}
      {showResult && dealer.holeCardRevealed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-xs"
        >
          {dealer.hand.isBlackjack && (
            <span className="text-gold font-bold">BLACKJACK!</span>
          )}
          {dealer.hand.isBusted && (
            <span className="text-red-400 font-bold">BUSTED!</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Compact dealer label for the table overlay.
 */
interface DealerLabelProps {
  dealer: Dealer;
  isActive: boolean;
}

export function DealerLabel({ dealer, isActive }: DealerLabelProps) {
  const visibleScore = dealer.holeCardRevealed
    ? formatScore(dealer.hand)
    : dealer.hand.cards.length > 0
      ? dealer.hand.cards[0].value + (dealer.hand.cards.length > 1 ? ' + ?' : '')
      : '';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <div className={`
        flex items-center gap-2 px-4 py-1 rounded-full text-sm font-display
        ${isActive 
          ? 'bg-gold text-rich-black font-bold' 
          : 'bg-black/50 text-cream/70'
        }
      `}>
        <Crown className="w-4 h-4" />
        Dealer
      </div>
      
      {dealer.hand.cards.length > 0 && (
        <div className={`
          text-lg font-bold
          ${dealer.hand.isBlackjack && dealer.holeCardRevealed ? 'text-gold' : ''}
          ${dealer.hand.isBusted ? 'text-red-400' : 'text-cream'}
        `}>
          {visibleScore}
        </div>
      )}
    </motion.div>
  );
}




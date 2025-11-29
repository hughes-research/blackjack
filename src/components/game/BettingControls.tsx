'use client';

import { motion } from 'framer-motion';
import { CHIP_DENOMINATIONS, MIN_BET, MAX_BET } from '@/types/game';
import { Coins, Trash2, Play, Sparkles } from 'lucide-react';

interface BettingControlsProps {
  currentBet: number;
  availableChips: number;
  onAddChip: (amount: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
  disabled?: boolean;
}

/**
 * Premium chip component with 3D effects.
 */
interface ChipProps {
  value: number;
  onClick: () => void;
  disabled: boolean;
}

function Chip({ value, onClick, disabled }: ChipProps) {
  const chipStyles: Record<number, { bg: string; ring: string; text: string; shadow: string }> = {
    10: { 
      bg: 'from-blue-600 via-blue-500 to-blue-700', 
      ring: 'ring-blue-400',
      text: 'text-white',
      shadow: 'shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
    },
    25: { 
      bg: 'from-emerald-600 via-emerald-500 to-emerald-700', 
      ring: 'ring-emerald-400',
      text: 'text-white',
      shadow: 'shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
    },
    50: { 
      bg: 'from-red-600 via-red-500 to-red-700', 
      ring: 'ring-red-400',
      text: 'text-white',
      shadow: 'shadow-[0_4px_20px_rgba(239,68,68,0.4)]'
    },
    100: { 
      bg: 'from-gray-900 via-gray-800 to-black', 
      ring: 'ring-gold',
      text: 'text-gold',
      shadow: 'shadow-[0_4px_20px_rgba(212,175,55,0.4)]'
    },
  };
  
  const style = chipStyles[value] || chipStyles[10];
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-16 rounded-full 
        bg-gradient-to-br ${style.bg}
        ${style.text} ${style.shadow}
        font-display font-bold text-base
        disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
        ring-4 ring-inset ${style.ring} ring-opacity-50
        flex items-center justify-center
        transition-all duration-200
      `}
      whileHover={disabled ? {} : { 
        scale: 1.15, 
        y: -8,
        boxShadow: `0 12px 30px rgba(212, 175, 55, 0.5)`,
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {/* Chip texture rings */}
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-current opacity-40" />
      <div className="absolute inset-4 rounded-full border border-current opacity-20" />
      
      {/* Value */}
      <span className="relative z-10 drop-shadow-lg">${value}</span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
      
      {/* Bottom shadow inside chip */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </motion.button>
  );
}

/**
 * Premium betting controls component.
 */
export function BettingControls({
  currentBet,
  availableChips,
  onAddChip,
  onClearBet,
  onDeal,
  disabled = false,
}: BettingControlsProps) {
  const canDeal = currentBet >= MIN_BET;
  const canAddMore = currentBet < MAX_BET && currentBet < availableChips;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative"
    >
      {/* Glow effect behind panel */}
      <div className="absolute -inset-4 bg-gold/10 rounded-3xl blur-2xl" />
      
      <div className="relative flex flex-col items-center gap-6 p-8 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl rounded-2xl border border-gold/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Decorative top accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full" />
        
        {/* Current Bet Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold/60" />
            <p className="text-gold/70 text-sm uppercase tracking-[0.2em] font-display">Your Bet</p>
            <Sparkles className="w-4 h-4 text-gold/60" />
          </div>
          
          <motion.div 
            className="flex items-center justify-center gap-3"
            key={currentBet}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            <Coins className="w-8 h-8 text-gold" />
            <span className="text-gold font-display text-5xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)]">
              ${currentBet}
            </span>
          </motion.div>
          
          <p className="text-cream/40 text-xs mt-2 tracking-wider">
            Min: ${MIN_BET} | Max: ${MAX_BET}
          </p>
        </div>
        
        {/* Chip Selection */}
        <div className="flex items-center gap-4">
          {CHIP_DENOMINATIONS.map((value, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Chip
                value={value}
                onClick={() => onAddChip(value)}
                disabled={disabled || !canAddMore || value > availableChips - currentBet}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Available Chips Display */}
        <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full border border-gold/20">
          <span className="text-cream/50 text-sm">Available:</span>
          <span className="text-gold font-display font-bold text-lg">${availableChips}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          {/* Clear Bet */}
          <motion.button
            onClick={onClearBet}
            disabled={disabled || currentBet === 0}
            className="flex-1 py-3 px-6 bg-gradient-to-b from-red-900/60 to-red-950/60 text-red-300 rounded-xl 
                       border border-red-700/40
                       disabled:opacity-30 disabled:cursor-not-allowed
                       hover:from-red-800/60 hover:to-red-900/60 hover:border-red-600/50
                       transition-all duration-200
                       flex items-center justify-center gap-2 font-display font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </motion.button>
          
          {/* Deal Button */}
          <motion.button
            onClick={onDeal}
            disabled={disabled || !canDeal}
            className="flex-1 relative py-3 px-6 overflow-hidden rounded-xl
                       disabled:opacity-30 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 font-display font-bold tracking-wider"
            whileHover={canDeal ? { scale: 1.02 } : {}}
            whileTap={canDeal ? { scale: 0.98 } : {}}
          >
            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
            
            {/* Shimmer effect */}
            {canDeal && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}
            
            {/* Border */}
            <div className="absolute inset-0 rounded-xl border border-gold-shine" />
            
            {/* Glow */}
            {canDeal && (
              <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
            )}
            
            {/* Content */}
            <Play className="relative w-5 h-5 fill-current text-rich-black" />
            <span className="relative text-rich-black">Deal</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

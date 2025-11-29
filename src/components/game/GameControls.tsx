'use client';

import { motion } from 'framer-motion';
import { Hand, Square, ArrowDownCircle, Copy, Shield, AlertTriangle } from 'lucide-react';

interface GameControlsProps {
  availableActions: string[];
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  disabled?: boolean;
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  available: boolean;
  hotkey?: string;
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  variant,
  available,
  hotkey,
}: ActionButtonProps) {
  if (!available) return null;
  
  const variants = {
    primary: {
      bg: 'from-gold-dark via-gold to-gold-dark',
      text: 'text-rich-black',
      border: 'border-gold-shine',
      shadow: 'shadow-[0_0_25px_rgba(212,175,55,0.4)]',
      glow: 'bg-gold/20',
    },
    secondary: {
      bg: 'from-casino-green-dark/90 via-casino-green/80 to-casino-green-dark/90',
      text: 'text-gold',
      border: 'border-gold/40 hover:border-gold/70',
      shadow: '',
      glow: 'bg-gold/10',
    },
    danger: {
      bg: 'from-red-900/80 via-red-800/80 to-red-900/80',
      text: 'text-red-200',
      border: 'border-red-700/50 hover:border-red-600/70',
      shadow: '',
      glow: 'bg-red-500/10',
    },
  };
  
  const style = variants[variant];
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center gap-1.5 
        py-4 px-6 min-w-[100px] rounded-xl overflow-hidden
        border ${style.border}
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-200
        group
      `}
      whileHover={disabled ? {} : { scale: 1.05, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${style.bg}`} />
      
      {/* Hover glow */}
      <div className={`absolute inset-0 ${style.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      {/* Primary button special effects */}
      {variant === 'primary' && (
        <>
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          />
          {/* Glow */}
          <div className={`absolute -inset-1 rounded-xl ${style.shadow} -z-10`} />
        </>
      )}
      
      {/* Icon */}
      <span className={`relative ${style.text}`}>
        {icon}
      </span>
      
      {/* Label */}
      <span className={`relative font-display font-bold text-sm tracking-wider ${style.text}`}>
        {label}
      </span>
      
      {/* Hotkey badge */}
      {hotkey && (
        <span className="absolute top-1 right-1 text-[10px] text-current/40 font-mono">
          {hotkey}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Premium game controls component.
 */
export function GameControls({
  availableActions,
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
  onSurrender,
  disabled = false,
}: GameControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative"
    >
      {/* Glow behind panel */}
      <div className="absolute -inset-4 bg-gold/5 rounded-3xl blur-2xl" />
      
      <div className="relative flex items-center justify-center gap-3 p-5 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl rounded-2xl border border-gold/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {/* Hit Button */}
        <ActionButton
          label="HIT"
          icon={<Hand className="w-6 h-6" />}
          onClick={onHit}
          disabled={disabled}
          variant="primary"
          available={availableActions.includes('hit')}
          hotkey="H"
        />
        
        {/* Stand Button */}
        <ActionButton
          label="STAND"
          icon={<Square className="w-6 h-6" />}
          onClick={onStand}
          disabled={disabled}
          variant="secondary"
          available={availableActions.includes('stand')}
          hotkey="S"
        />
        
        {/* Double Down Button */}
        <ActionButton
          label="DOUBLE"
          icon={<ArrowDownCircle className="w-6 h-6" />}
          onClick={onDoubleDown}
          disabled={disabled}
          variant="secondary"
          available={availableActions.includes('double')}
          hotkey="D"
        />
        
        {/* Split Button */}
        <ActionButton
          label="SPLIT"
          icon={<Copy className="w-6 h-6" />}
          onClick={onSplit}
          disabled={disabled}
          variant="secondary"
          available={availableActions.includes('split')}
          hotkey="P"
        />
        
        {/* Surrender Button */}
        <ActionButton
          label="SURRENDER"
          icon={<Shield className="w-6 h-6" />}
          onClick={onSurrender}
          disabled={disabled}
          variant="danger"
          available={availableActions.includes('surrender')}
          hotkey="R"
        />
      </div>
    </motion.div>
  );
}

/**
 * Premium insurance prompt component.
 */
interface InsurancePromptProps {
  bet: number;
  onAccept: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

export function InsurancePrompt({
  bet,
  onAccept,
  onDecline,
  disabled = false,
}: InsurancePromptProps) {
  const insuranceCost = Math.floor(bet / 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative"
    >
      {/* Warning glow */}
      <motion.div 
        className="absolute -inset-4 bg-yellow-500/20 rounded-3xl blur-2xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="relative flex flex-col items-center gap-5 p-8 bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Warning icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </motion.div>
        
        <div className="text-center">
          <h3 className="text-gold font-display text-2xl font-bold mb-2">
            Insurance?
          </h3>
          <p className="text-cream/70 text-sm max-w-xs">
            Dealer shows an Ace. Protect your hand against blackjack?
          </p>
          <p className="text-yellow-400/80 text-sm mt-3 font-semibold">
            Cost: ${insuranceCost} <span className="text-cream/50">(pays 2:1 if dealer has blackjack)</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full">
          <motion.button
            onClick={onDecline}
            disabled={disabled}
            className="flex-1 py-3 px-6 bg-transparent text-cream/70 border border-cream/20 rounded-xl
                       hover:bg-cream/5 hover:text-cream hover:border-cream/40
                       transition-all duration-200 font-display font-semibold
                       disabled:opacity-30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            No Thanks
          </motion.button>
          
          <motion.button
            onClick={onAccept}
            disabled={disabled}
            className="flex-1 relative py-3 px-6 overflow-hidden rounded-xl font-display font-bold
                       disabled:opacity-30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600" />
            <div className="absolute inset-0 rounded-xl border border-yellow-400" />
            <span className="relative text-rich-black">Buy Insurance</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

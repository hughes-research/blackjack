'use client';

import { motion } from 'framer-motion';
import { SessionStats, STARTING_CHIPS } from '@/types/game';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  BarChart3,
  Percent,
  Coins,
  Award
} from 'lucide-react';

interface StatsDisplayProps {
  stats: SessionStats;
  currentChips: number;
}

/**
 * Large stat card component.
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'gold' | 'green' | 'red' | 'default';
}

function StatCard({ icon, label, value, subValue, color = 'default' }: StatCardProps) {
  const colorClasses = {
    gold: 'text-gold border-gold/30 bg-gold/5',
    green: 'text-green-400 border-green-400/30 bg-green-900/10',
    red: 'text-red-400 border-red-400/30 bg-red-900/10',
    default: 'text-cream border-gold/20 bg-black/20',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex flex-col items-center gap-2 p-6 rounded-lg border
        ${colorClasses[color]}
      `}
    >
      <div className="text-3xl">{icon}</div>
      <div className="text-4xl font-display font-bold">{value}</div>
      <div className="text-sm opacity-70 uppercase tracking-wider">{label}</div>
      {subValue && <div className="text-xs opacity-50">{subValue}</div>}
    </motion.div>
  );
}

/**
 * Progress bar component.
 */
interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color: 'green' | 'red' | 'yellow';
}

function ProgressBar({ value, max, label, color }: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-cream/70">{label}</span>
        <span className="text-cream">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

/**
 * Full statistics display component.
 */
export function StatsDisplay({ stats, currentChips }: StatsDisplayProps) {
  const winRate = stats.handsPlayed > 0 
    ? (stats.handsWon / stats.handsPlayed) * 100 
    : 0;
  
  const netProfit = stats.totalWon - stats.totalLost;
  const profitFromStart = currentChips - STARTING_CHIPS;
  
  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-8 h-8" />}
          label="Hands Played"
          value={stats.handsPlayed}
          color="default"
        />
        
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subValue={`${stats.handsWon} wins`}
          color={winRate >= 50 ? 'green' : 'red'}
        />
        
        <StatCard
          icon={<Zap className="w-8 h-8" />}
          label="Blackjacks"
          value={stats.blackjacks}
          color="gold"
        />
        
        <StatCard
          icon={profitFromStart >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
          label="Net Profit"
          value={`${netProfit >= 0 ? '+' : ''}$${netProfit}`}
          color={netProfit >= 0 ? 'green' : 'red'}
        />
      </div>
      
      {/* Win/Loss/Push Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-black/30 rounded-lg border border-gold/20"
      >
        <h3 className="flex items-center gap-2 text-gold font-display text-lg mb-4">
          <BarChart3 className="w-5 h-5" />
          Hand Results
        </h3>
        
        <div className="space-y-3">
          <ProgressBar
            value={stats.handsWon}
            max={stats.handsPlayed}
            label="Wins"
            color="green"
          />
          <ProgressBar
            value={stats.handsLost}
            max={stats.handsPlayed}
            label="Losses"
            color="red"
          />
          <ProgressBar
            value={stats.handsPushed}
            max={stats.handsPlayed}
            label="Pushes"
            color="yellow"
          />
        </div>
      </motion.div>
      
      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30 text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Total Won</span>
          </div>
          <div className="text-green-400 text-2xl font-display font-bold">
            +${stats.totalWon}
          </div>
        </div>
        
        <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Total Lost</span>
          </div>
          <div className="text-red-400 text-2xl font-display font-bold">
            -${stats.totalLost}
          </div>
        </div>
        
        <div className="p-4 bg-gold/10 rounded-lg border border-gold/30 text-center">
          <div className="flex items-center justify-center gap-2 text-gold mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Highest Chips</span>
          </div>
          <div className="text-gold text-2xl font-display font-bold">
            ${stats.highestChips}
          </div>
        </div>
      </motion.div>
      
      {/* Current Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center p-6 bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 rounded-lg border border-gold/30"
      >
        <div className="flex items-center justify-center gap-3">
          <Coins className="w-8 h-8 text-gold" />
          <div>
            <div className="text-cream/60 text-sm uppercase tracking-wider">Current Bankroll</div>
            <div className="text-gold text-4xl font-display font-bold">${currentChips}</div>
            <div className={`text-sm ${profitFromStart >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitFromStart >= 0 ? '+' : ''}{profitFromStart} from start
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


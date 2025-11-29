'use client';

import { motion } from 'framer-motion';
import { SessionStats, Player } from '@/types/game';
import { Trophy, TrendingUp, TrendingDown, Coins, Target, Zap } from 'lucide-react';

interface ScoreBoardProps {
  stats: SessionStats;
  players: Player[];
  roundNumber: number;
}

/**
 * Stat item component.
 */
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatItem({ icon, label, value, highlight = false }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={highlight ? 'text-gold' : 'text-cream/50'}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-cream/50 text-xs uppercase tracking-wider">{label}</span>
        <span className={`font-display font-bold ${highlight ? 'text-gold' : 'text-cream'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Session statistics scoreboard.
 */
export function ScoreBoard({ stats, players, roundNumber }: ScoreBoardProps) {
  const winRate = stats.handsPlayed > 0 
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100) 
    : 0;
  
  const netProfit = stats.totalWon - stats.totalLost;
  
  // Find user player
  const userPlayer = players.find(p => p.type === 'user');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-gold/20 min-w-[200px]"
    >
      {/* Round Number */}
      <div className="text-center pb-3 border-b border-gold/20">
        <span className="text-cream/50 text-xs uppercase tracking-wider">Round</span>
        <div className="text-gold font-display text-3xl font-bold">{roundNumber}</div>
      </div>
      
      {/* User's Chips */}
      {userPlayer && (
        <div className="text-center pb-3 border-b border-gold/20">
          <span className="text-cream/50 text-xs uppercase tracking-wider">Your Chips</span>
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-gold" />
            <span className="text-gold font-display text-2xl font-bold">
              ${userPlayer.chips}
            </span>
          </div>
        </div>
      )}
      
      {/* Session Stats */}
      <div className="space-y-3">
        <StatItem
          icon={<Target className="w-4 h-4" />}
          label="Hands Played"
          value={stats.handsPlayed}
        />
        
        <StatItem
          icon={<Trophy className="w-4 h-4" />}
          label="Win Rate"
          value={`${winRate}%`}
          highlight={winRate >= 50}
        />
        
        <StatItem
          icon={<Zap className="w-4 h-4" />}
          label="Blackjacks"
          value={stats.blackjacks}
          highlight={stats.blackjacks > 0}
        />
        
        <StatItem
          icon={netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          label="Net Profit"
          value={`${netProfit >= 0 ? '+' : ''}$${netProfit}`}
          highlight={netProfit > 0}
        />
      </div>
      
      {/* Win/Loss/Push Breakdown */}
      <div className="flex justify-between text-xs pt-3 border-t border-gold/20">
        <div className="text-center">
          <div className="text-green-400 font-bold">{stats.handsWon}</div>
          <div className="text-cream/40">Won</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-bold">{stats.handsLost}</div>
          <div className="text-cream/40">Lost</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-bold">{stats.handsPushed}</div>
          <div className="text-cream/40">Push</div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact stats display for mobile/small screens.
 */
export function CompactStats({ stats, roundNumber }: { stats: SessionStats; roundNumber: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-6 py-2 px-4 bg-black/30 rounded-full"
    >
      <div className="flex items-center gap-1 text-sm">
        <span className="text-cream/50">Round:</span>
        <span className="text-gold font-bold">{roundNumber}</span>
      </div>
      
      <div className="flex items-center gap-1 text-sm">
        <span className="text-green-400">{stats.handsWon}W</span>
        <span className="text-cream/30">/</span>
        <span className="text-red-400">{stats.handsLost}L</span>
      </div>
      
      {stats.blackjacks > 0 && (
        <div className="flex items-center gap-1 text-sm">
          <Zap className="w-3 h-3 text-gold" />
          <span className="text-gold">{stats.blackjacks}</span>
        </div>
      )}
    </motion.div>
  );
}


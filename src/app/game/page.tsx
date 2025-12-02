'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useBlackjack } from '@/hooks/useBlackjack';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BettingControls } from '@/components/game/BettingControls';
import { GameControls, InsurancePrompt } from '@/components/game/GameControls';
import { VisualGameTable } from '@/components/game/VisualGameTable';
import { getAvailableActions } from '@/lib/blackjack';
import { ANIMATION_DELAYS, MIN_BET } from '@/types/game';
import { RefreshCw, Home, Trophy, Zap, TrendingUp, Coins, Sparkles, AlertCircle } from 'lucide-react';

// Dynamically import FloatingParticles with ssr: false to avoid hydration mismatch
const FloatingParticles = dynamic(
  () => import('@/components/game/FloatingParticles'),
  { ssr: false }
);

/**
 * Luxurious header stats bar.
 */
function HeaderStats({ 
  roundNumber, 
  stats, 
  userChips 
}: { 
  roundNumber: number; 
  stats: { handsWon: number; handsLost: number; blackjacks: number };
  userChips: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      {/* Round badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-gold/20">
        <span className="text-gold/60 text-sm">Round</span>
        <span className="text-gold font-display font-bold text-lg">{roundNumber}</span>
      </div>
      
      {/* Stats pills */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 rounded-full border border-green-700/30">
          <Trophy className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400 text-sm font-semibold">{stats.handsWon}W</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 rounded-full border border-red-700/30">
          <span className="text-red-400 text-sm font-semibold">{stats.handsLost}L</span>
        </div>
        {stats.blackjacks > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/20 rounded-full border border-gold/30">
            <Zap className="w-3.5 h-3.5 text-gold" />
            <span className="text-gold text-sm font-semibold">{stats.blackjacks}</span>
          </div>
        )}
      </div>
      
      {/* Chips display */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 backdrop-blur-sm rounded-full border border-gold/30">
        <Coins className="w-4 h-4 text-gold" />
        <span className="text-gold font-display font-bold">${userChips}</span>
      </div>
    </motion.div>
  );
}

/**
 * Stunning side panel with detailed stats.
 */
function SidePanel({ 
  stats, 
  roundNumber,
  userChips 
}: { 
  stats: any; 
  roundNumber: number;
  userChips: number;
}) {
  const winRate = stats.handsPlayed > 0 
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100) 
    : 0;
  const netProfit = stats.totalWon - stats.totalLost;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="hidden xl:flex flex-col gap-4 w-72"
    >
      {/* Main stats card */}
      <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-md rounded-2xl border border-gold/20 overflow-hidden">
        {/* Header with glow */}
        <div className="relative p-4 border-b border-gold/10">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5" />
          <div className="relative flex items-center justify-between">
            <span className="text-gold/60 text-sm uppercase tracking-wider">Session Stats</span>
            <Sparkles className="w-4 h-4 text-gold/40" />
          </div>
        </div>
        
        {/* Stats grid */}
        <div className="p-4 space-y-4">
          {/* Chips */}
          <div className="text-center p-4 bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 rounded-xl border border-gold/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-gold" />
              <span className="text-gold/60 text-xs uppercase tracking-wider">Your Chips</span>
            </div>
            <div className="text-gold font-display text-3xl font-bold">${userChips}</div>
          </div>
          
          {/* Win rate */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold/60" />
              <span className="text-cream/60 text-sm">Win Rate</span>
            </div>
            <span className={`font-display font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </span>
          </div>
          
          {/* Hands played */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <span className="text-cream/60 text-sm">Hands Played</span>
            <span className="text-cream font-display font-bold">{stats.handsPlayed}</span>
          </div>
          
          {/* Blackjacks */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-cream/60 text-sm">Blackjacks</span>
            </div>
            <span className="text-gold font-display font-bold">{stats.blackjacks}</span>
          </div>
          
          {/* Net profit */}
          <div className={`
            flex items-center justify-between p-3 rounded-lg
            ${netProfit >= 0 ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}
          `}>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-cream/60 text-sm">Net Profit</span>
            </div>
            <span className={`font-display font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}${netProfit}
            </span>
          </div>
        </div>
        
        {/* Win/Loss bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-black/30">
            {stats.handsPlayed > 0 && (
              <>
                <motion.div
                  className="bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.handsWon / stats.handsPlayed) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
                <motion.div
                  className="bg-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.handsPushed / stats.handsPlayed) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
                <motion.div
                  className="bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.handsLost / stats.handsPlayed) * 100}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
              </>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-cream/40">
            <span>{stats.handsWon} Won</span>
            <span>{stats.handsPushed} Push</span>
            <span>{stats.handsLost} Lost</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main game page component.
 */
export default function GamePage() {
  const {
    players,
    dealer,
    phase,
    currentPlayerIndex,
    roundNumber,
    settings,
    stats,
    initGame,
    placeBet,
    clearBet,
    startDealing,
    dealInitialCards,
    buyInsurance,
    declineInsurance,
    processInsurancePhase,
    hit,
    stand,
    doubleDown,
    split,
    surrender,
    playDealerTurn,
    nextRound,
    playAITurn,
    startOver,
  } = useBlackjack();
  
  // Initialize game on mount
  useEffect(() => {
    if (phase === 'idle') {
      initGame();
    }
  }, [phase, initGame]);
  
  // Handle dealing phase
  useEffect(() => {
    if (phase === 'dealing') {
      const timer = setTimeout(() => {
        dealInitialCards();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, dealInitialCards]);
  
  // Handle dealer turn
  useEffect(() => {
    if (phase === 'dealer-turn') {
      const timer = setTimeout(() => {
        playDealerTurn();
      }, ANIMATION_DELAYS[settings.animationSpeed] + 500);
      return () => clearTimeout(timer);
    }
  }, [phase, playDealerTurn, settings.animationSpeed]);
  
  // Handle AI turns
  useEffect(() => {
    if (phase === 'playing' && players[currentPlayerIndex]?.type === 'ai') {
      const timer = setTimeout(() => {
        playAITurn(players[currentPlayerIndex].id);
      }, ANIMATION_DELAYS[settings.animationSpeed] * 2);
      return () => clearTimeout(timer);
    }
  }, [phase, currentPlayerIndex, players, playAITurn, settings.animationSpeed]);
  
  // Get current user player
  const userPlayer = useMemo(() => 
    players.find(p => p.type === 'user'),
    [players]
  );
  
  // Get available actions for user
  const activePlayer = players[currentPlayerIndex];
  const availableActions = useMemo(() => {
    if (!userPlayer || phase !== 'playing' || activePlayer?.type !== 'user') {
      return [];
    }
    return getAvailableActions(userPlayer, settings);
  }, [userPlayer, activePlayer, settings, phase]);
  
  // Handlers
  const handleAddChip = useCallback((amount: number) => {
    if (userPlayer) placeBet(userPlayer.id, amount);
  }, [userPlayer, placeBet]);
  
  const handleClearBet = useCallback(() => {
    if (userPlayer) clearBet(userPlayer.id);
  }, [userPlayer, clearBet]);
  
  const handleDeal = useCallback(() => startDealing(), [startDealing]);
  
  const handleHit = useCallback(() => {
    if (userPlayer) hit(userPlayer.id);
  }, [userPlayer, hit]);
  
  const handleStand = useCallback(() => {
    if (userPlayer) stand(userPlayer.id);
  }, [userPlayer, stand]);
  
  const handleDoubleDown = useCallback(() => {
    if (userPlayer) doubleDown(userPlayer.id);
  }, [userPlayer, doubleDown]);
  
  const handleSplit = useCallback(() => {
    if (userPlayer) split(userPlayer.id);
  }, [userPlayer, split]);
  
  const handleSurrender = useCallback(() => {
    if (userPlayer) surrender(userPlayer.id);
  }, [userPlayer, surrender]);
  
  const handleBuyInsurance = useCallback(() => {
    if (userPlayer) {
      buyInsurance(userPlayer.id);
      processInsurancePhase();
    }
  }, [userPlayer, buyInsurance, processInsurancePhase]);
  
  const handleDeclineInsurance = useCallback(() => {
    if (userPlayer) {
      declineInsurance(userPlayer.id);
      processInsurancePhase();
    }
  }, [userPlayer, declineInsurance, processInsurancePhase]);
  
  const isUserTurn = phase === 'playing' && activePlayer?.type === 'user';
  
  // Check if user is broke (no chips and no current bet)
  const isUserBroke = userPlayer && userPlayer.chips < MIN_BET && userPlayer.bets[0] === 0;
  
  // Handle start over (full reset)
  const handleStartOver = useCallback(() => {
    startOver();
  }, [startOver]);
  
  return (
    <main className="relative min-h-screen overflow-hidden bg-casino-green-dark">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/58471.jpg"
          alt="Casino felt background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      </div>
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 border-b border-gold/10 bg-black/20 backdrop-blur-sm">
        <Breadcrumbs items={[{ label: 'Game' }]} />
        
        {userPlayer && (
          <HeaderStats
            roundNumber={roundNumber}
            stats={stats}
            userChips={userPlayer.chips}
          />
        )}
        
        <Link href="/">
          <motion.button
            className="p-2.5 bg-black/40 rounded-full text-gold/70 hover:text-gold hover:bg-black/60 transition-all border border-gold/20 hover:border-gold/40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-5 h-5" />
          </motion.button>
        </Link>
      </header>
      
      {/* Main content */}
      <div className="relative z-10 flex min-h-[calc(100vh-73px)]">
        {/* Game table area */}
        <div className="flex-1 relative">
          <VisualGameTable
            players={players}
            dealer={dealer}
            currentPlayerIndex={currentPlayerIndex}
            phase={phase}
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {/* Betting Phase - Game Over with Start Over option */}
                {phase === 'betting' && userPlayer && isUserBroke && settings.allowRebuy && (
                  <motion.div
                    key="game-over-restart"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="flex justify-center"
                  >
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                      <h3 className="text-red-400 font-display text-3xl font-bold mb-2">GAME OVER</h3>
                      <p className="text-cream/60 mb-6">
                        You&apos;ve lost all your chips! Your session stats will be cleared.
                      </p>
                      <motion.button
                        onClick={handleStartOver}
                        className="group relative flex items-center justify-center gap-3 w-full py-4 px-8 overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-xl" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="absolute inset-0 rounded-xl border border-gold-shine shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
                        <RefreshCw className="relative w-5 h-5 text-rich-black" />
                        <span className="relative font-display text-lg font-bold text-rich-black tracking-wider">
                          Start Over
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                
                {/* Betting Phase - Game Over (No restart allowed) */}
                {phase === 'betting' && userPlayer && isUserBroke && !settings.allowRebuy && (
                  <motion.div
                    key="game-over-final"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="flex justify-center"
                  >
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                      <h3 className="text-red-400 font-display text-3xl font-bold mb-2">GAME OVER</h3>
                      <p className="text-cream/60 mb-6">
                        You&apos;ve lost all your chips. Enable &quot;Allow Restart&quot; in Settings to play again.
                      </p>
                      <Link href="/settings">
                        <motion.button
                          className="group relative flex items-center justify-center gap-3 w-full py-4 px-8 overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-casino-green-dark/80 rounded-xl border border-gold/30" />
                          <span className="relative font-display text-lg font-bold text-gold tracking-wider">
                            Go to Settings
                          </span>
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )}
                
                {/* Betting Phase - Normal */}
                {phase === 'betting' && userPlayer && !isUserBroke && (
                  <motion.div
                    key="betting"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="flex justify-center"
                  >
                    <BettingControls
                      currentBet={userPlayer.bets[0]}
                      availableChips={userPlayer.chips}
                      onAddChip={handleAddChip}
                      onClearBet={handleClearBet}
                      onDeal={handleDeal}
                    />
                  </motion.div>
                )}
                
                {/* Dealing Phase */}
                {phase === 'dealing' && (
                  <motion.div
                    key="dealing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-center"
                  >
                    <div className="px-8 py-4 bg-black/60 backdrop-blur-md rounded-2xl border border-gold/30">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5 text-gold" />
                        </motion.div>
                        <p className="text-gold font-display text-xl">Dealing cards...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Insurance Phase */}
                {phase === 'insurance' && userPlayer && (
                  <motion.div
                    key="insurance"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-center"
                  >
                    <InsurancePrompt
                      bet={userPlayer.bets[0]}
                      onAccept={handleBuyInsurance}
                      onDecline={handleDeclineInsurance}
                    />
                  </motion.div>
                )}
                
                {/* Playing Phase */}
                {phase === 'playing' && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="flex justify-center"
                  >
                    {isUserTurn ? (
                      <GameControls
                        availableActions={availableActions}
                        onHit={handleHit}
                        onStand={handleStand}
                        onDoubleDown={handleDoubleDown}
                        onSplit={handleSplit}
                        onSurrender={handleSurrender}
                      />
                    ) : (
                      <div className="px-8 py-4 bg-black/60 backdrop-blur-md rounded-2xl border border-gold/20">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 rounded-full bg-gold" />
                          </motion.div>
                          <p className="text-gold/80 font-display">
                            <span className="text-gold">{activePlayer?.name}</span> is thinking...
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Dealer Turn */}
                {phase === 'dealer-turn' && (
                  <motion.div
                    key="dealer-turn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-center"
                  >
                    <div className="px-8 py-4 bg-black/60 backdrop-blur-md rounded-2xl border border-gold/30">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-gold" />
                        </motion.div>
                        <p className="text-gold font-display text-xl">Dealer&apos;s turn...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Round End */}
                {phase === 'round-end' && (
                  <motion.div
                    key="round-end"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="flex justify-center"
                  >
                    <motion.button
                      onClick={nextRound}
                      className="group relative flex items-center gap-3 py-4 px-10 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Button background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      
                      {/* Border glow */}
                      <div className="absolute inset-0 rounded-xl border border-gold-shine shadow-[0_0_30px_rgba(212,175,55,0.4)]" />
                      
                      {/* Content */}
                      <RefreshCw className="relative w-5 h-5 text-rich-black" />
                      <span className="relative font-display text-xl font-bold text-rich-black tracking-wider">
                        New Round
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Side panel */}
        <div className="p-4">
          <SidePanel
            stats={stats}
            roundNumber={roundNumber}
            userChips={userPlayer?.chips || 0}
          />
        </div>
      </div>
    </main>
  );
}

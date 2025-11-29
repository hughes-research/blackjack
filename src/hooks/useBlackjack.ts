/**
 * Zustand store for blackjack game state management.
 * Handles all game actions and state transitions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  GameState,
  Player,
  Dealer,
  Hand,
  Settings,
  SessionStats,
  GamePhase,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  STARTING_CHIPS,
  MIN_BET,
  MAX_BET,
} from '@/types/game';
import {
  createDeck,
  shuffleDeck,
  createEmptyHand,
  addCardToHand,
  dealCard,
} from '@/lib/deck';
import {
  determineWinner,
  calculatePayout,
  calculateInsurancePayout,
  dealerShouldHit,
  shouldOfferInsurance,
} from '@/lib/blackjack';
import { getAIDecision, getAIBetAmount, shouldAIBuyInsurance } from '@/lib/ai';
import {
  canDoubleDown,
  canSplit,
  canSurrender,
} from '@/lib/blackjack';

/**
 * Creates a new player with default values.
 */
function createPlayer(id: string, name: string, type: 'user' | 'ai', position: number): Player {
  return {
    id,
    name,
    type,
    hands: [createEmptyHand()],
    activeHandIndex: 0,
    chips: STARTING_CHIPS,
    bets: [0],
    position,
    isActive: false,
    hasSurrendered: false,
    hasInsurance: false,
    insuranceBet: 0,
    hasActed: false,
    results: ['pending'],
  };
}

/**
 * Creates a new dealer with default values.
 */
function createDealer(): Dealer {
  return {
    hand: createEmptyHand(),
    holeCardRevealed: false,
  };
}

/**
 * Resets a player for a new round.
 */
function resetPlayerForRound(player: Player): Player {
  return {
    ...player,
    hands: [createEmptyHand()],
    activeHandIndex: 0,
    bets: [0],
    isActive: false,
    hasSurrendered: false,
    hasInsurance: false,
    insuranceBet: 0,
    hasActed: false,
    results: ['pending'],
  };
}

interface BlackjackActions {
  // Game initialization
  initGame: () => void;
  resetGame: () => void;
  
  // Betting phase
  placeBet: (playerId: string, amount: number) => void;
  clearBet: (playerId: string) => void;
  startDealing: () => void;
  
  // Dealing phase
  dealInitialCards: () => Promise<void>;
  
  // Insurance phase
  buyInsurance: (playerId: string) => void;
  declineInsurance: (playerId: string) => void;
  processInsurancePhase: () => void;
  
  // Playing phase
  hit: (playerId: string) => void;
  stand: (playerId: string) => void;
  doubleDown: (playerId: string) => void;
  split: (playerId: string) => void;
  surrender: (playerId: string) => void;
  
  // Turn management
  nextPlayer: () => void;
  nextHand: (playerId: string) => void;
  
  // Dealer phase
  playDealerTurn: () => Promise<void>;
  
  // Payout phase
  calculatePayouts: () => void;
  
  // Round management
  nextRound: () => void;
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => void;
  
  // AI actions
  playAITurn: (playerId: string) => Promise<void>;
}

type BlackjackStore = GameState & BlackjackActions;

export const useBlackjack = create<BlackjackStore>()(
  persist(
    (set, get) => ({
      // Initial state
      players: [],
      dealer: createDealer(),
      deck: [],
      currentPlayerIndex: 0,
      phase: 'idle' as GamePhase,
      roundNumber: 0,
      settings: DEFAULT_SETTINGS,
      stats: DEFAULT_STATS,

      // Game initialization
      initGame: () => {
        const { settings } = get();
        const deck = shuffleDeck(createDeck(settings.numberOfDecks));
        
        const players: Player[] = [
          createPlayer('player-0', 'Alex', 'ai', 0),
          createPlayer('player-1', 'You', 'user', 1),
          createPlayer('player-2', 'Sam', 'ai', 2),
        ];
        
        set({
          players,
          dealer: createDealer(),
          deck,
          currentPlayerIndex: 0,
          phase: 'betting',
          roundNumber: 1,
        });
      },

      resetGame: () => {
        set({
          players: [],
          dealer: createDealer(),
          deck: [],
          currentPlayerIndex: 0,
          phase: 'idle',
          roundNumber: 0,
          stats: DEFAULT_STATS,
        });
      },

      // Betting phase
      placeBet: (playerId: string, amount: number) => {
        const { players } = get();
        
        set({
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const newBet = Math.min(p.bets[0] + amount, Math.min(p.chips, MAX_BET));
            return {
              ...p,
              bets: [newBet],
            };
          }),
        });
      },

      clearBet: (playerId: string) => {
        const { players } = get();
        
        set({
          players: players.map(p => 
            p.id === playerId ? { ...p, bets: [0] } : p
          ),
        });
      },

      startDealing: () => {
        const { players } = get();
        
        // Auto-bet for AI players
        const updatedPlayers = players.map(p => {
          if (p.type === 'ai' && p.bets[0] === 0) {
            const aiBet = getAIBetAmount(p.chips, MIN_BET, MAX_BET);
            return { ...p, bets: [aiBet] };
          }
          return p;
        });
        
        // Validate all players have bets
        const allBetsPlaced = updatedPlayers.every(p => p.bets[0] >= MIN_BET);
        if (!allBetsPlaced) return;
        
        // Deduct bets from chips
        const playersWithDeductedBets = updatedPlayers.map(p => ({
          ...p,
          chips: p.chips - p.bets[0],
        }));
        
        set({
          players: playersWithDeductedBets,
          phase: 'dealing',
        });
      },

      // Dealing phase
      dealInitialCards: async () => {
        const { players, dealer, deck } = get();
        let currentDeck = [...deck];
        let updatedPlayers = [...players];
        let updatedDealer = { ...dealer };
        
        // Deal two cards to each player and dealer
        // First round: one card each
        for (let i = 0; i < updatedPlayers.length; i++) {
          const [card, newDeck] = dealCard(currentDeck);
          currentDeck = newDeck;
          updatedPlayers[i] = {
            ...updatedPlayers[i],
            hands: [addCardToHand(updatedPlayers[i].hands[0], card, true)],
          };
        }
        
        // Dealer's first card (face up)
        const [dealerCard1, deckAfterDealer1] = dealCard(currentDeck);
        currentDeck = deckAfterDealer1;
        updatedDealer = {
          ...updatedDealer,
          hand: addCardToHand(updatedDealer.hand, dealerCard1, true),
        };
        
        // Second round: one card each
        for (let i = 0; i < updatedPlayers.length; i++) {
          const [card, newDeck] = dealCard(currentDeck);
          currentDeck = newDeck;
          updatedPlayers[i] = {
            ...updatedPlayers[i],
            hands: [addCardToHand(updatedPlayers[i].hands[0], card, true)],
          };
        }
        
        // Dealer's second card (face down - hole card)
        const [dealerCard2, deckAfterDealer2] = dealCard(currentDeck);
        currentDeck = deckAfterDealer2;
        updatedDealer = {
          ...updatedDealer,
          hand: addCardToHand(updatedDealer.hand, dealerCard2, false),
        };
        
        set({
          players: updatedPlayers,
          dealer: updatedDealer,
          deck: currentDeck,
        });
        
        // Check if insurance should be offered
        if (shouldOfferInsurance(updatedDealer)) {
          set({ phase: 'insurance' });
        } else {
          // Start playing phase
          set({
            phase: 'playing',
            currentPlayerIndex: 0,
            players: updatedPlayers.map((p, i) => ({
              ...p,
              isActive: i === 0,
            })),
          });
        }
      },

      // Insurance phase
      buyInsurance: (playerId: string) => {
        const { players } = get();
        
        set({
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const insuranceCost = Math.floor(p.bets[0] / 2);
            return {
              ...p,
              hasInsurance: true,
              insuranceBet: insuranceCost,
              chips: p.chips - insuranceCost,
            };
          }),
        });
      },

      declineInsurance: (playerId: string) => {
        const { players } = get();
        
        set({
          players: players.map(p => 
            p.id === playerId ? { ...p, hasInsurance: false } : p
          ),
        });
      },

      processInsurancePhase: () => {
        const { players } = get();
        
        // AI players decide on insurance
        const updatedPlayers = players.map(p => {
          if (p.type === 'ai' && !p.hasInsurance) {
            if (shouldAIBuyInsurance()) {
              const insuranceCost = Math.floor(p.bets[0] / 2);
              return {
                ...p,
                hasInsurance: true,
                insuranceBet: insuranceCost,
                chips: p.chips - insuranceCost,
              };
            }
          }
          return p;
        });
        
        set({
          players: updatedPlayers,
          phase: 'playing',
          currentPlayerIndex: 0,
        });
        
        // Set first player as active
        set({
          players: updatedPlayers.map((p, i) => ({
            ...p,
            isActive: i === 0,
          })),
        });
      },

      // Playing phase actions
      hit: (playerId: string) => {
        const { players, deck } = get();
        const [card, newDeck] = dealCard(deck);
        
        set({
          deck: newDeck,
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const newHands = [...p.hands];
            newHands[p.activeHandIndex] = addCardToHand(
              newHands[p.activeHandIndex],
              card,
              true
            );
            
            return {
              ...p,
              hands: newHands,
              hasActed: true,
            };
          }),
        });
        
        // Check if player busted or got 21
        const player = get().players.find(p => p.id === playerId);
        if (player) {
          const hand = player.hands[player.activeHandIndex];
          if (hand.isBusted || hand.score === 21) {
            get().nextHand(playerId);
          }
        }
      },

      stand: (playerId: string) => {
        const { players } = get();
        
        set({
          players: players.map(p => 
            p.id === playerId ? { ...p, hasActed: true } : p
          ),
        });
        
        get().nextHand(playerId);
      },

      doubleDown: (playerId: string) => {
        const { players, deck } = get();
        const [card, newDeck] = dealCard(deck);
        
        set({
          deck: newDeck,
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const currentBet = p.bets[p.activeHandIndex];
            const newBets = [...p.bets];
            newBets[p.activeHandIndex] = currentBet * 2;
            
            const newHands = [...p.hands];
            newHands[p.activeHandIndex] = addCardToHand(
              newHands[p.activeHandIndex],
              card,
              true
            );
            
            return {
              ...p,
              hands: newHands,
              bets: newBets,
              chips: p.chips - currentBet,
              hasActed: true,
            };
          }),
        });
        
        get().nextHand(playerId);
      },

      split: (playerId: string) => {
        const { players, deck } = get();
        let currentDeck = [...deck];
        
        set({
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const currentHand = p.hands[p.activeHandIndex];
            const currentBet = p.bets[p.activeHandIndex];
            
            // Create two new hands from the pair
            const card1 = currentHand.cards[0];
            const card2 = currentHand.cards[1];
            
            // Deal one card to each new hand
            const [newCard1, deck1] = dealCard(currentDeck);
            const [newCard2, deck2] = dealCard(deck1);
            currentDeck = deck2;
            
            const hand1 = addCardToHand(
              addCardToHand(createEmptyHand(), card1, true),
              newCard1,
              true
            );
            const hand2 = addCardToHand(
              addCardToHand(createEmptyHand(), card2, true),
              newCard2,
              true
            );
            
            const newHands = [...p.hands];
            newHands[p.activeHandIndex] = hand1;
            newHands.push(hand2);
            
            const newBets = [...p.bets];
            newBets.push(currentBet);
            
            const newResults = [...p.results];
            newResults.push('pending');
            
            return {
              ...p,
              hands: newHands,
              bets: newBets,
              results: newResults,
              chips: p.chips - currentBet,
              hasActed: false, // Can still act on split hands
            };
          }),
        });
        
        set({ deck: currentDeck });
      },

      surrender: (playerId: string) => {
        const { players } = get();
        
        set({
          players: players.map(p => {
            if (p.id !== playerId) return p;
            
            const currentBet = p.bets[p.activeHandIndex];
            const refund = Math.floor(currentBet / 2);
            
            return {
              ...p,
              hasSurrendered: true,
              chips: p.chips + refund,
              results: ['surrender'],
              hasActed: true,
            };
          }),
        });
        
        get().nextPlayer();
      },

      // Turn management
      nextHand: (playerId: string) => {
        const { players } = get();
        const player = players.find(p => p.id === playerId);
        
        if (!player) return;
        
        // Check if there are more hands to play (from splits)
        if (player.activeHandIndex < player.hands.length - 1) {
          set({
            players: players.map(p => 
              p.id === playerId
                ? { ...p, activeHandIndex: p.activeHandIndex + 1, hasActed: false }
                : p
            ),
          });
        } else {
          // Move to next player
          get().nextPlayer();
        }
      },

      nextPlayer: () => {
        const { players, currentPlayerIndex } = get();
        
        // Deactivate current player
        const updatedPlayers = players.map((p, i) => ({
          ...p,
          isActive: false,
        }));
        
        const nextIndex = currentPlayerIndex + 1;
        
        if (nextIndex >= players.length) {
          // All players done, dealer's turn
          set({
            players: updatedPlayers,
            phase: 'dealer-turn',
          });
        } else {
          // Next player's turn
          set({
            players: updatedPlayers.map((p, i) => ({
              ...p,
              isActive: i === nextIndex,
            })),
            currentPlayerIndex: nextIndex,
          });
          
          // If next player is AI, play their turn
          const nextPlayer = updatedPlayers[nextIndex];
          if (nextPlayer.type === 'ai') {
            setTimeout(() => {
              get().playAITurn(nextPlayer.id);
            }, 500);
          }
        }
      },

      // Dealer phase
      playDealerTurn: async () => {
        const { dealer, settings, deck } = get();
        let currentDeck = [...deck];
        let updatedDealer = { ...dealer };
        
        // Reveal hole card
        updatedDealer = {
          ...updatedDealer,
          hand: {
            ...updatedDealer.hand,
            cards: updatedDealer.hand.cards.map(c => ({ ...c, faceUp: true })),
          },
          holeCardRevealed: true,
        };
        
        set({ dealer: updatedDealer });
        
        // Dealer draws according to rules
        while (dealerShouldHit(updatedDealer.hand, settings)) {
          const [card, newDeck] = dealCard(currentDeck);
          currentDeck = newDeck;
          updatedDealer = {
            ...updatedDealer,
            hand: addCardToHand(updatedDealer.hand, card, true),
          };
          
          set({ dealer: updatedDealer, deck: currentDeck });
        }
        
        // Move to payout
        set({ phase: 'payout' });
        get().calculatePayouts();
      },

      // Payout phase
      calculatePayouts: () => {
        const { players, dealer, settings, stats } = get();
        let newStats = { ...stats };
        
        const updatedPlayers = players.map(p => {
          let totalPayout = 0;
          const newResults = [...p.results];
          
          // Process each hand
          p.hands.forEach((hand, index) => {
            const bet = p.bets[index];
            const result = determineWinner(hand, dealer.hand, p.hasSurrendered);
            newResults[index] = result;
            
            const payout = calculatePayout(result, bet, settings);
            totalPayout += payout;
            
            // Update stats
            newStats.handsPlayed++;
            if (result === 'win') newStats.handsWon++;
            else if (result === 'lose') newStats.handsLost++;
            else if (result === 'push') newStats.handsPushed++;
            else if (result === 'blackjack') {
              newStats.handsWon++;
              newStats.blackjacks++;
            }
            
            if (payout > 0) newStats.totalWon += payout;
            else newStats.totalLost += Math.abs(payout);
          });
          
          // Process insurance
          if (p.hasInsurance) {
            const insurancePayout = calculateInsurancePayout(
              p.insuranceBet,
              dealer.hand.isBlackjack
            );
            totalPayout += insurancePayout;
          }
          
          // Return original bet + winnings (bets were deducted at start)
          const originalBets = p.bets.reduce((sum, bet) => sum + bet, 0);
          const newChips = p.chips + originalBets + totalPayout;
          
          newStats.highestChips = Math.max(newStats.highestChips, newChips);
          
          return {
            ...p,
            chips: newChips,
            results: newResults,
          };
        });
        
        set({
          players: updatedPlayers,
          stats: newStats,
          phase: 'round-end',
        });
      },

      // Round management
      nextRound: () => {
        const { players, settings, roundNumber, deck } = get();
        
        // Check if deck needs reshuffling (when less than 25% remains)
        let newDeck = deck;
        const deckThreshold = settings.numberOfDecks * 52 * 0.25;
        if (deck.length < deckThreshold) {
          newDeck = shuffleDeck(createDeck(settings.numberOfDecks));
        }
        
        // Reset players for new round
        const resetPlayers = players.map(p => resetPlayerForRound(p));
        
        set({
          players: resetPlayers,
          dealer: createDealer(),
          deck: newDeck,
          currentPlayerIndex: 0,
          phase: 'betting',
          roundNumber: roundNumber + 1,
        });
      },

      // Settings
      updateSettings: (newSettings: Partial<Settings>) => {
        const { settings } = get();
        set({
          settings: { ...settings, ...newSettings },
        });
      },

      // AI actions
      playAITurn: async (playerId: string) => {
        const { players, dealer, settings } = get();
        const player = players.find(p => p.id === playerId);
        
        if (!player || player.type !== 'ai') return;
        
        const hand = player.hands[player.activeHandIndex];
        
        // Skip if hand is done
        if (hand.isBusted || hand.score === 21 || hand.isBlackjack) {
          get().nextHand(playerId);
          return;
        }
        
        const decision = getAIDecision(
          hand,
          dealer,
          settings,
          canDoubleDown(hand, player, settings, player.hands.length > 1),
          canSplit(hand, player),
          canSurrender(hand, player, settings)
        );
        
        switch (decision) {
          case 'hit':
            get().hit(playerId);
            // Continue AI turn if not busted and under 21
            const updatedPlayer = get().players.find(p => p.id === playerId);
            if (updatedPlayer) {
              const updatedHand = updatedPlayer.hands[updatedPlayer.activeHandIndex];
              if (!updatedHand.isBusted && updatedHand.score < 21) {
                setTimeout(() => get().playAITurn(playerId), 500);
              }
            }
            break;
          case 'stand':
            get().stand(playerId);
            break;
          case 'double':
            get().doubleDown(playerId);
            break;
          case 'split':
            get().split(playerId);
            setTimeout(() => get().playAITurn(playerId), 500);
            break;
          case 'surrender':
            get().surrender(playerId);
            break;
          default:
            get().stand(playerId);
        }
      },
    }),
    {
      name: 'blackjack-storage',
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
      }),
    }
  )
);

/**
 * Hook to get settings from the store.
 */
export function useSettings() {
  return useBlackjack(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
    }))
  );
}

/**
 * Hook to get statistics from the store.
 */
export function useStats() {
  return useBlackjack((state) => state.stats);
}


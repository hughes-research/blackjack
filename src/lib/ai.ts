/**
 * AI player logic for blackjack.
 * Implements basic strategy for mathematically optimal play decisions.
 * 
 * @module lib/ai
 */

import { Hand, Dealer, Settings, PlayerAction } from '@/types/game';
import { getDealerUpcardValue, isPair, getPairValue } from './deck';
import { clamp, roundToNearest } from './utils';
import { 
  ACE_HIGH_VALUE, 
  AI_BET_PERCENTAGE,
  CHIP_DENOMINATIONS,
} from './constants';

// =============================================================================
// STRATEGY TYPES
// =============================================================================

/**
 * Basic strategy decision codes.
 * H = Hit, S = Stand, D = Double (hit if not allowed), 
 * P = Split, R = Surrender (hit if not allowed)
 */
type StrategyDecision = 'H' | 'S' | 'D' | 'P' | 'R';

/** Dealer upcard values for strategy lookup (2-11, where 11 = Ace) */
type DealerUpcard = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** Strategy chart row type */
type StrategyRow = Record<DealerUpcard, StrategyDecision>;

/** Pair strategy row type */
type PairStrategyRow = Record<DealerUpcard, 'Y' | 'N'>;

// =============================================================================
// STRATEGY CHARTS
// =============================================================================

/**
 * Hard totals strategy chart.
 * Based on standard basic strategy for multi-deck games.
 * Rows: Player hard total (4-21)
 * Columns: Dealer upcard value (2-11, where 11 = Ace)
 */
const HARD_STRATEGY: Record<number, StrategyRow> = {
  4:  { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  5:  { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  6:  { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  7:  { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  8:  { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  9:  { 2: 'H', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  10: { 2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'H', 11: 'H' },
  11: { 2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'D', 11: 'D' },
  12: { 2: 'H', 3: 'H', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  13: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  14: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  15: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'R', 11: 'R' },
  16: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'R', 10: 'R', 11: 'R' },
  17: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  18: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  19: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  20: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  21: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
} as const;

/**
 * Soft totals strategy chart.
 * Rows: Player soft total (13-21, representing A2 through A10)
 * Columns: Dealer upcard value (2-11)
 */
const SOFT_STRATEGY: Record<number, StrategyRow> = {
  13: { 2: 'H', 3: 'H', 4: 'H', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  14: { 2: 'H', 3: 'H', 4: 'H', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  15: { 2: 'H', 3: 'H', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  16: { 2: 'H', 3: 'H', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  17: { 2: 'H', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  18: { 2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'S', 8: 'S', 9: 'H', 10: 'H', 11: 'H' },
  19: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'D', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  20: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
  21: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
} as const;

/**
 * Pair splitting strategy chart.
 * Key: Card value of the pair (2-11, where 11 = Ace)
 * Y = Split, N = Don't split
 */
const PAIR_STRATEGY: Record<number, PairStrategyRow> = {
  2:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  3:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  4:  { 2: 'N', 3: 'N', 4: 'N', 5: 'Y', 6: 'Y', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  5:  { 2: 'N', 3: 'N', 4: 'N', 5: 'N', 6: 'N', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  6:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  7:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  8:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'Y', 9: 'Y', 10: 'Y', 11: 'Y' },
  9:  { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'N', 8: 'Y', 9: 'Y', 10: 'N', 11: 'N' },
  10: { 2: 'N', 3: 'N', 4: 'N', 5: 'N', 6: 'N', 7: 'N', 8: 'N', 9: 'N', 10: 'N', 11: 'N' },
  11: { 2: 'Y', 3: 'Y', 4: 'Y', 5: 'Y', 6: 'Y', 7: 'Y', 8: 'Y', 9: 'Y', 10: 'Y', 11: 'Y' },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalizes dealer upcard value for strategy lookup.
 * 
 * @param value - Raw upcard value
 * @returns Normalized value (2-11) for chart lookup
 */
function normalizeUpcardValue(value: number): DealerUpcard {
  // Ace (value 1 or 11) should map to 11 for lookup
  if (value === 1 || value === 11) return 11;
  return clamp(value, 2, 10) as DealerUpcard;
}

/**
 * Looks up the strategy decision from the appropriate chart.
 * 
 * @param hand - Player's hand
 * @param dealerValue - Normalized dealer upcard value
 * @returns Strategy decision code
 */
function lookupStrategy(hand: Hand, dealerValue: DealerUpcard): StrategyDecision {
  if (hand.isSoft && hand.score >= 13 && hand.score <= 21) {
    return SOFT_STRATEGY[hand.score]?.[dealerValue] ?? 'H';
  }
  
  const score = clamp(hand.score, 4, 21);
  return HARD_STRATEGY[score]?.[dealerValue] ?? 'H';
}

/**
 * Checks if AI should split based on pair strategy.
 * 
 * @param hand - Player's hand
 * @param dealerValue - Normalized dealer upcard value
 * @returns True if should split
 */
function shouldSplit(hand: Hand, dealerValue: DealerUpcard): boolean {
  if (!isPair(hand)) return false;
  
  const pairValue = getPairValue(hand);
  if (pairValue === 0) return false;
  
  return PAIR_STRATEGY[pairValue]?.[dealerValue] === 'Y';
}

/**
 * Converts a strategy decision to a player action.
 * 
 * @param decision - Strategy decision code
 * @param canDouble - Whether doubling is allowed
 * @param canSurrenderHand - Whether surrender is allowed
 * @returns Player action
 */
function decisionToAction(
  decision: StrategyDecision,
  canDouble: boolean,
  canSurrenderHand: boolean
): PlayerAction {
  switch (decision) {
    case 'S':
      return 'stand';
    case 'D':
      return canDouble ? 'double' : 'hit';
    case 'R':
      return canSurrenderHand ? 'surrender' : 'hit';
    case 'P':
      return 'split';
    case 'H':
    default:
      return 'hit';
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Determines the AI decision using basic strategy.
 * 
 * @param hand - The AI player's hand
 * @param dealer - The dealer
 * @param settings - Game settings (unused but kept for interface consistency)
 * @param canDoubleDown - Whether double down is allowed
 * @param canSplitHand - Whether split is allowed
 * @param canSurrenderHand - Whether surrender is allowed
 * @returns The recommended action
 */
export function getAIDecision(
  hand: Hand,
  dealer: Dealer,
  _settings: Settings,
  canDoubleDown: boolean,
  canSplitHand: boolean,
  canSurrenderHand: boolean
): PlayerAction {
  // Get and normalize dealer's upcard value
  const rawDealerValue = getDealerUpcardValue(dealer.hand);
  if (rawDealerValue === 0) return 'stand';
  
  const dealerValue = normalizeUpcardValue(rawDealerValue);
  
  // Blackjack or busted - always stand
  if (hand.isBlackjack || hand.isBusted) {
    return 'stand';
  }
  
  // Check for split opportunity first
  if (canSplitHand && shouldSplit(hand, dealerValue)) {
    return 'split';
  }
  
  // Look up strategy and convert to action
  const decision = lookupStrategy(hand, dealerValue);
  return decisionToAction(decision, canDoubleDown, canSurrenderHand);
}

/**
 * Determines if AI should buy insurance.
 * Basic strategy: Never buy insurance (mathematically unfavorable).
 * 
 * @returns Always false - insurance is not recommended
 */
export function shouldAIBuyInsurance(): boolean {
  return false;
}

/**
 * Determines the AI bet amount using conservative strategy.
 * Bets a percentage of chips, rounded to nearest denomination.
 * 
 * @param chips - Current chip count
 * @param minBet - Minimum bet allowed
 * @param maxBet - Maximum bet allowed
 * @returns The bet amount
 */
export function getAIBetAmount(
  chips: number,
  minBet: number,
  maxBet: number
): number {
  // Calculate target bet as percentage of chips
  const targetBet = Math.floor(chips * AI_BET_PERCENTAGE);
  
  // Round to nearest chip denomination
  const roundedBet = roundToNearest(targetBet, CHIP_DENOMINATIONS);
  
  // Clamp to valid range
  return clamp(roundedBet || minBet, minBet, Math.min(maxBet, chips));
}

// =============================================================================
// STRATEGY INFO (for debugging/display)
// =============================================================================

/**
 * Gets the raw strategy decision for debugging.
 * 
 * @param hand - Player's hand
 * @param dealerUpcard - Dealer's visible card value
 * @returns Strategy decision code
 */
export function getStrategyDecision(
  hand: Hand,
  dealerUpcard: number
): StrategyDecision {
  const normalizedDealer = normalizeUpcardValue(dealerUpcard);
  
  if (isPair(hand)) {
    const pairValue = getPairValue(hand);
    if (PAIR_STRATEGY[pairValue]?.[normalizedDealer] === 'Y') {
      return 'P';
    }
  }
  
  return lookupStrategy(hand, normalizedDealer);
}

/**
 * Utility functions for the blackjack game.
 * Contains helper functions, formatters, and common operations.
 */

import { Hand, Player, RoundResult } from '@/types/game';

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generates a unique ID using crypto API with fallback.
 * More secure than Math.random() for unique identifiers.
 */
export function generateId(prefix: string = ''): string {
  const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  
  return prefix ? `${prefix}_${randomPart}` : randomPart;
}

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Immutably updates an item in an array by predicate.
 */
export function updateArrayItem<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map(item => predicate(item) ? updater(item) : item);
}

/**
 * Immutably updates an item in an array by ID.
 */
export function updateById<T extends { id: string }>(
  array: T[],
  id: string,
  updater: (item: T) => T
): T[] {
  return updateArrayItem(array, item => item.id === id, updater);
}

/**
 * Finds an item by ID with type safety.
 */
export function findById<T extends { id: string }>(
  array: T[],
  id: string
): T | undefined {
  return array.find(item => item.id === id);
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

/**
 * Clamps a number between min and max values.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to the nearest denomination.
 */
export function roundToNearest(value: number, denominations: readonly number[]): number {
  for (const denom of [...denominations].sort((a, b) => b - a)) {
    if (value >= denom) {
      return Math.floor(value / denom) * denom;
    }
  }
  return denominations[denominations.length - 1] || value;
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Formats a chip amount for display with currency symbol.
 */
export function formatChips(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

/**
 * Formats a hand score for display.
 */
export function formatHandScore(hand: Hand): string {
  if (hand.isBlackjack) return 'Blackjack!';
  if (hand.isBusted) return 'Bust';
  if (hand.cards.length === 0) return '-';
  if (hand.isSoft) return `Soft ${hand.score}`;
  return hand.score.toString();
}

/**
 * Formats a round result for display.
 */
export function formatResult(result: RoundResult): string {
  const resultMap: Record<RoundResult, string> = {
    win: 'Win!',
    lose: 'Lose',
    push: 'Push',
    blackjack: 'Blackjack!',
    surrender: 'Surrendered',
    pending: '',
  };
  return resultMap[result];
}

/**
 * Gets the CSS class for a result.
 */
export function getResultClass(result: RoundResult): string {
  const classMap: Record<RoundResult, string> = {
    win: 'text-green-400',
    lose: 'text-red-400',
    push: 'text-yellow-400',
    blackjack: 'text-gold',
    surrender: 'text-gray-400',
    pending: '',
  };
  return classMap[result];
}

// =============================================================================
// PLAYER UTILITIES
// =============================================================================

/**
 * Gets the active hand for a player.
 */
export function getActiveHand(player: Player): Hand {
  return player.hands[player.activeHandIndex] || player.hands[0];
}

/**
 * Gets the current bet for a player's active hand.
 */
export function getActiveBet(player: Player): number {
  return player.bets[player.activeHandIndex] || 0;
}

/**
 * Checks if a player has any remaining hands to play.
 */
export function hasRemainingHands(player: Player): boolean {
  return player.activeHandIndex < player.hands.length - 1;
}

/**
 * Gets the total bet across all hands.
 */
export function getTotalBet(player: Player): number {
  return player.bets.reduce((sum, bet) => sum + bet, 0);
}

/**
 * Checks if a player is the user.
 */
export function isUserPlayer(player: Player): boolean {
  return player.type === 'user';
}

/**
 * Checks if a player is an AI.
 */
export function isAIPlayer(player: Player): boolean {
  return player.type === 'ai';
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates a bet amount.
 */
export function isValidBet(amount: number, minBet: number, maxBet: number, chips: number): boolean {
  return amount >= minBet && amount <= maxBet && amount <= chips;
}

/**
 * Validates deck count.
 */
export function isValidDeckCount(count: number): boolean {
  return count >= 1 && count <= 8 && Number.isInteger(count);
}

// =============================================================================
// DELAY UTILITIES
// =============================================================================

/**
 * Creates a promise that resolves after a delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates animation delay based on speed setting.
 */
export function getAnimationDelay(
  baseDelay: number,
  speed: 'slow' | 'normal' | 'fast'
): number {
  const multipliers = { slow: 2, normal: 1, fast: 0.5 };
  return Math.round(baseDelay * multipliers[speed]);
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for checking if a value is defined.
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard for checking if array is non-empty.
 */
export function isNonEmpty<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}


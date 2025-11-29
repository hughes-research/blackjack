/**
 * Blackjack game type definitions.
 * Core types and interfaces for the game state and entities.
 * 
 * @module types/game
 */

// =============================================================================
// CARD TYPES
// =============================================================================

/** Card suit types */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/** Card rank types */
export type Rank = 
  | 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' 
  | 'jack' | 'queen' | 'king';

/** 
 * Represents a single playing card.
 */
export interface Card {
  /** Unique identifier for the card instance */
  readonly id: string;
  /** Card suit */
  readonly suit: Suit;
  /** Card rank */
  readonly rank: Rank;
  /** Card value (1-11 for ace, 2-10, 10 for face cards) */
  readonly value: number;
  /** Path to the card SVG image */
  readonly imagePath: string;
  /** Whether the card is face up */
  faceUp: boolean;
}

// =============================================================================
// HAND TYPES
// =============================================================================

/**
 * Represents a player's hand of cards.
 */
export interface Hand {
  /** Cards in the hand */
  readonly cards: Card[];
  /** Current score of the hand */
  readonly score: number;
  /** Whether the hand has busted (over 21) */
  readonly isBusted: boolean;
  /** Whether the hand is a natural blackjack */
  readonly isBlackjack: boolean;
  /** Whether the hand contains an ace counted as 11 */
  readonly isSoft: boolean;
}

// =============================================================================
// PLAYER TYPES
// =============================================================================

/** Player type classification */
export type PlayerType = 'user' | 'ai';

/** Player action options */
export type PlayerAction = 
  | 'hit' 
  | 'stand' 
  | 'double' 
  | 'split' 
  | 'surrender' 
  | 'insurance';

/** Round result types */
export type RoundResult = 
  | 'win' 
  | 'lose' 
  | 'push' 
  | 'blackjack' 
  | 'surrender' 
  | 'pending';

/**
 * Represents a player in the game.
 */
export interface Player {
  /** Unique player identifier */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Type of player */
  readonly type: PlayerType;
  /** Position at the table (0-2 for players) */
  readonly position: number;
  /** Player's current hands (multiple if split) */
  hands: Hand[];
  /** Index of the active hand when split */
  activeHandIndex: number;
  /** Total chips available */
  chips: number;
  /** Current bet amount for each hand */
  bets: number[];
  /** Whether it's this player's turn */
  isActive: boolean;
  /** Whether the player has surrendered */
  hasSurrendered: boolean;
  /** Whether the player has taken insurance */
  hasInsurance: boolean;
  /** Insurance bet amount */
  insuranceBet: number;
  /** Whether the first action has been taken */
  hasActed: boolean;
  /** Result of the current round for each hand */
  results: RoundResult[];
}

// =============================================================================
// DEALER TYPES
// =============================================================================

/**
 * Represents the dealer.
 */
export interface Dealer {
  /** Dealer's hand */
  hand: Hand;
  /** Whether the hole card has been revealed */
  holeCardRevealed: boolean;
}

// =============================================================================
// GAME STATE TYPES
// =============================================================================

/** Game phases in order of play */
export type GamePhase = 
  | 'idle'
  | 'betting' 
  | 'dealing' 
  | 'insurance'
  | 'playing' 
  | 'dealer-turn' 
  | 'payout' 
  | 'round-end';

/** Animation speed options */
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

/** Blackjack payout options */
export type BlackjackPayout = '3:2' | '6:5';

/**
 * Game settings configuration.
 */
export interface Settings {
  /** Number of decks in the shoe (1-8) */
  readonly numberOfDecks: number;
  /** Whether dealer hits on soft 17 */
  readonly dealerHitsSoft17: boolean;
  /** Blackjack payout ratio */
  readonly blackjackPays: BlackjackPayout;
  /** Whether surrender is allowed */
  readonly allowSurrender: boolean;
  /** Whether double down after split is allowed */
  readonly allowDoubleAfterSplit: boolean;
  /** Animation speed */
  readonly animationSpeed: AnimationSpeed;
}

/**
 * Session statistics tracking.
 */
export interface SessionStats {
  /** Total hands played */
  handsPlayed: number;
  /** Hands won */
  handsWon: number;
  /** Hands lost */
  handsLost: number;
  /** Hands pushed (tied) */
  handsPushed: number;
  /** Number of blackjacks */
  blackjacks: number;
  /** Total amount won */
  totalWon: number;
  /** Total amount lost */
  totalLost: number;
  /** Highest chip count achieved */
  highestChips: number;
}

/**
 * Complete game state.
 */
export interface GameState {
  /** All players (excluding dealer) */
  readonly players: Player[];
  /** The dealer */
  readonly dealer: Dealer;
  /** Current deck/shoe */
  readonly deck: Card[];
  /** Index of current player's turn */
  readonly currentPlayerIndex: number;
  /** Current game phase */
  readonly phase: GamePhase;
  /** Current round number */
  readonly roundNumber: number;
  /** Game settings */
  readonly settings: Settings;
  /** Session statistics */
  readonly stats: SessionStats;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default game settings.
 */
export const DEFAULT_SETTINGS: Settings = {
  numberOfDecks: 6,
  dealerHitsSoft17: true,
  blackjackPays: '3:2',
  allowSurrender: true,
  allowDoubleAfterSplit: true,
  animationSpeed: 'normal',
} as const;

/**
 * Default session statistics.
 */
export const DEFAULT_STATS: SessionStats = {
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  handsPushed: 0,
  blackjacks: 0,
  totalWon: 0,
  totalLost: 0,
  highestChips: 1000,
} as const;

// =============================================================================
// RE-EXPORTS FROM CONSTANTS
// =============================================================================

// Re-export commonly used constants for convenience
export { 
  STARTING_CHIPS, 
  MIN_BET, 
  MAX_BET, 
  CHIP_DENOMINATIONS,
} from '@/lib/constants';

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================

/**
 * Animation delay configuration based on speed setting.
 */
export const ANIMATION_DELAYS: Record<AnimationSpeed, number> = {
  slow: 800,
  normal: 400,
  fast: 200,
} as const;

// =============================================================================
// TABLE LAYOUT
// =============================================================================

/**
 * Player positions on the table (semi-circle layout).
 * Position 0: Left, Position 1: Center (User), Position 2: Right
 */
export const PLAYER_POSITIONS = {
  0: { x: -3, y: -2, label: 'Left' },
  1: { x: 0, y: -3, label: 'Center' },
  2: { x: 3, y: -2, label: 'Right' },
} as const;

/**
 * Dealer position on the table.
 */
export const DEALER_POSITION = { x: 0, y: 2 } as const;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for checking if a result is a win.
 */
export function isWinResult(result: RoundResult): result is 'win' | 'blackjack' {
  return result === 'win' || result === 'blackjack';
}

/**
 * Type guard for checking if a result is a loss.
 */
export function isLossResult(result: RoundResult): result is 'lose' | 'surrender' {
  return result === 'lose' || result === 'surrender';
}

/**
 * Type guard for checking if a phase allows player actions.
 */
export function isActionPhase(phase: GamePhase): phase is 'playing' {
  return phase === 'playing';
}

/**
 * Type guard for checking if a phase is waiting for bets.
 */
export function isBettingPhase(phase: GamePhase): phase is 'betting' {
  return phase === 'betting';
}

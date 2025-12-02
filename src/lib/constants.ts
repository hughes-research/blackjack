/**
 * Application-wide constants.
 * Centralizes magic numbers and configuration values.
 */

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

/** Starting chip amount for each player */
export const STARTING_CHIPS = 1000;

/** Minimum bet amount allowed */
export const MIN_BET = 10;

/** Maximum bet amount allowed */
export const MAX_BET = 500;

/** Available chip denominations for betting */
export const CHIP_DENOMINATIONS = [10, 25, 50, 100] as const;

/** Maximum number of hands per player (after splits) */
export const MAX_HANDS_PER_PLAYER = 4;

/** Maximum number of decks in a shoe */
export const MAX_DECKS = 8;

/** Minimum number of decks in a shoe */
export const MIN_DECKS = 1;

/** Cards per deck */
export const CARDS_PER_DECK = 52;

// =============================================================================
// DECK MANAGEMENT
// =============================================================================

/** 
 * Deck penetration threshold for reshuffling.
 * Reshuffle when deck falls below this percentage.
 */
export const RESHUFFLE_THRESHOLD = 0.25;

// =============================================================================
// PAYOUT RATIOS
// =============================================================================

/** Blackjack payout multiplier for 3:2 */
export const BLACKJACK_PAYOUT_3_2 = 1.5;

/** Blackjack payout multiplier for 6:5 */
export const BLACKJACK_PAYOUT_6_5 = 1.2;

/** Regular win payout multiplier (1:1) */
export const REGULAR_WIN_PAYOUT = 1;

/** Insurance payout multiplier (2:1) */
export const INSURANCE_PAYOUT = 2;

// =============================================================================
// AI CONFIGURATION
// =============================================================================

/** AI bet percentage of total chips (conservative) */
export const AI_BET_PERCENTAGE = 0.05;

// =============================================================================
// ANIMATION TIMING (milliseconds)
// =============================================================================

export const ANIMATION_TIMING = {
  /** Delay between AI actions */
  AI_ACTION_DELAY: 500,
  /** Card deal animation duration */
  CARD_DEAL: 300,
  /** Card flip animation duration */
  CARD_FLIP: 200,
  /** Phase transition delay */
  PHASE_TRANSITION: 100,
} as const;

/** Animation speeds mapped to multipliers */
export const ANIMATION_SPEED_MULTIPLIERS = {
  slow: 2,
  normal: 1,
  fast: 0.5,
} as const;

// =============================================================================
// PLAYER POSITIONS (Table Layout)
// =============================================================================

export const TABLE_POSITIONS = {
  /** Player positions on semi-circle */
  players: {
    0: { x: -3, y: -2, label: 'Left' },
    1: { x: 0, y: -3, label: 'Center' },
    2: { x: 3, y: -2, label: 'Right' },
  },
  /** Dealer position */
  dealer: { x: 0, y: 2 },
} as const;

// =============================================================================
// PLAYER CONFIGURATION
// =============================================================================

export const DEFAULT_PLAYERS = [
  { id: 'player-0', name: 'Alex', type: 'ai' as const, position: 0 },
  { id: 'player-1', name: 'You', type: 'user' as const, position: 1 },
  { id: 'player-2', name: 'Sam', type: 'ai' as const, position: 2 },
] as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  GAME_STATE: 'blackjack-storage',
  SETTINGS: 'blackjack-settings',
  STATS: 'blackjack-stats',
} as const;

// =============================================================================
// CARD VALUES
// =============================================================================

/** Value of an Ace when counted as high */
export const ACE_HIGH_VALUE = 11;

/** Value of an Ace when counted as low */
export const ACE_LOW_VALUE = 1;

/** Difference between ace values (for score calculation) */
export const ACE_VALUE_DIFFERENCE = ACE_HIGH_VALUE - ACE_LOW_VALUE;

/** Value of face cards (Jack, Queen, King) */
export const FACE_CARD_VALUE = 10;

/** Blackjack score */
export const BLACKJACK_SCORE = 21;

/** Dealer stand threshold */
export const DEALER_STAND_THRESHOLD = 17;




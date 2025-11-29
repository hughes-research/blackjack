/**
 * Deck management utilities for blackjack.
 * Handles deck creation, shuffling, and card operations.
 * 
 * @module lib/deck
 */

import { Card, Suit, Rank, Hand } from '@/types/game';
import { generateId } from './utils';
import {
  ACE_HIGH_VALUE,
  ACE_VALUE_DIFFERENCE,
  BLACKJACK_SCORE,
  CARDS_PER_DECK,
} from './constants';

// =============================================================================
// CONSTANTS
// =============================================================================

/** All possible suits in standard deck order */
const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

/** All possible ranks in standard deck order */
const RANKS: readonly Rank[] = [
  'ace', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'jack', 'queen', 'king',
] as const;

/** Mapping of rank to base value */
const RANK_VALUES: Readonly<Record<Rank, number>> = {
  ace: ACE_HIGH_VALUE,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  jack: 10,
  queen: 10,
  king: 10,
} as const;

// =============================================================================
// CARD CREATION
// =============================================================================

/**
 * Generates the image path for a card.
 * 
 * @param rank - The card rank
 * @param suit - The card suit
 * @returns Path to the card's SVG image
 */
export function getCardImagePath(rank: Rank, suit: Suit): string {
  return `/cards/${rank}_of_${suit}.svg`;
}

/**
 * Creates a single card with all properties initialized.
 * 
 * @param rank - The card rank
 * @param suit - The card suit
 * @param deckIndex - Index of the deck for multi-deck shoes
 * @returns A new Card object
 */
export function createCard(rank: Rank, suit: Suit, deckIndex: number = 0): Card {
  return {
    id: generateId(`${rank}_${suit}_${deckIndex}`),
    rank,
    suit,
    value: RANK_VALUES[rank],
    faceUp: false,
    imagePath: getCardImagePath(rank, suit),
  };
}

/**
 * Creates a standard 52-card deck.
 * 
 * @param deckIndex - Index for unique card IDs in multi-deck shoes
 * @returns Array of 52 Card objects
 */
export function createSingleDeck(deckIndex: number = 0): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank, suit, deckIndex));
    }
  }
  
  return deck;
}

/**
 * Creates a multi-deck shoe for casino-style play.
 * 
 * @param numberOfDecks - Number of decks to combine (1-8)
 * @returns Combined array of cards from all decks
 * @throws Error if numberOfDecks is invalid
 */
export function createDeck(numberOfDecks: number = 6): Card[] {
  if (numberOfDecks < 1 || numberOfDecks > 8) {
    throw new Error(`Invalid deck count: ${numberOfDecks}. Must be between 1 and 8.`);
  }
  
  const shoe: Card[] = [];
  
  for (let i = 0; i < numberOfDecks; i++) {
    shoe.push(...createSingleDeck(i));
  }
  
  return shoe;
}

/**
 * Gets the expected card count for a shoe.
 * 
 * @param numberOfDecks - Number of decks in the shoe
 * @returns Expected total cards
 */
export function getExpectedCardCount(numberOfDecks: number): number {
  return numberOfDecks * CARDS_PER_DECK;
}

// =============================================================================
// SHUFFLING
// =============================================================================

/**
 * Shuffles a deck using the Fisher-Yates algorithm.
 * Provides an unbiased shuffle with O(n) complexity.
 * 
 * @param deck - Array of cards to shuffle
 * @returns New shuffled array (original is not mutated)
 */
export function shuffleDeck(deck: readonly Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// =============================================================================
// HAND SCORING
// =============================================================================

/**
 * Score calculation result with soft hand indicator.
 */
interface ScoreResult {
  /** Total hand score */
  total: number;
  /** Whether the hand is soft (ace counted as 11) */
  isSoft: boolean;
}

/**
 * Calculates the optimal score of a hand, handling aces.
 * Aces are counted as 11 unless that would bust the hand.
 * 
 * @param cards - Array of cards in the hand
 * @returns Score result with total and soft indicator
 */
export function calculateHandScore(cards: readonly Card[]): ScoreResult {
  let total = 0;
  let aceCount = 0;
  
  for (const card of cards) {
    if (card.rank === 'ace') {
      aceCount++;
      total += ACE_HIGH_VALUE;
    } else {
      total += card.value;
    }
  }
  
  // Reduce aces from 11 to 1 as needed to avoid busting
  while (total > BLACKJACK_SCORE && aceCount > 0) {
    total -= ACE_VALUE_DIFFERENCE;
    aceCount--;
  }
  
  // Hand is soft if there's still an ace counted as 11
  const isSoft = aceCount > 0 && total <= BLACKJACK_SCORE;
  
  return { total, isSoft };
}

// =============================================================================
// HAND MANAGEMENT
// =============================================================================

/**
 * Creates an empty hand with default values.
 * 
 * @returns A new empty Hand object
 */
export function createEmptyHand(): Hand {
  return {
    cards: [],
    score: 0,
    isBusted: false,
    isBlackjack: false,
    isSoft: false,
  };
}

/**
 * Updates hand score and status based on current cards.
 * 
 * @param hand - The hand to update
 * @returns Updated Hand object with recalculated properties
 */
export function updateHandScore(hand: Hand): Hand {
  const { total, isSoft } = calculateHandScore(hand.cards);
  const cardCount = hand.cards.length;
  
  return {
    ...hand,
    score: total,
    isBusted: total > BLACKJACK_SCORE,
    isBlackjack: cardCount === 2 && total === BLACKJACK_SCORE,
    isSoft,
  };
}

/**
 * Adds a card to a hand and updates the score.
 * 
 * @param hand - The hand to add to
 * @param card - The card to add
 * @param faceUp - Whether the card should be face up
 * @returns New Hand object with the card added
 */
export function addCardToHand(hand: Hand, card: Card, faceUp: boolean = true): Hand {
  const newCard: Card = { ...card, faceUp };
  const newHand: Hand = {
    ...hand,
    cards: [...hand.cards, newCard],
  };
  
  return updateHandScore(newHand);
}

/**
 * Reveals all cards in a hand (sets faceUp to true).
 * 
 * @param hand - The hand to reveal
 * @returns New Hand with all cards face up
 */
export function revealHand(hand: Hand): Hand {
  return {
    ...hand,
    cards: hand.cards.map(card => ({ ...card, faceUp: true })),
  };
}

// =============================================================================
// DEALING
// =============================================================================

/**
 * Deals a card from the deck.
 * 
 * @param deck - The deck to deal from
 * @returns Tuple of [dealt card, remaining deck]
 * @throws Error if deck is empty
 */
export function dealCard(deck: readonly Card[]): [Card, Card[]] {
  if (deck.length === 0) {
    throw new Error('Cannot deal from empty deck');
  }
  
  const newDeck = [...deck];
  const card = newDeck.pop()!;
  
  return [card, newDeck];
}

/**
 * Deals multiple cards from the deck.
 * 
 * @param deck - The deck to deal from
 * @param count - Number of cards to deal
 * @returns Tuple of [dealt cards array, remaining deck]
 * @throws Error if not enough cards in deck
 */
export function dealCards(deck: readonly Card[], count: number): [Card[], Card[]] {
  if (deck.length < count) {
    throw new Error(`Cannot deal ${count} cards from deck with ${deck.length} cards`);
  }
  
  const newDeck = [...deck];
  const cards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    cards.push(newDeck.pop()!);
  }
  
  return [cards, newDeck];
}

// =============================================================================
// HAND ANALYSIS
// =============================================================================

/**
 * Checks if a hand is a pair (can be split).
 * 
 * @param hand - The hand to check
 * @returns True if the hand has exactly 2 cards of the same rank
 */
export function isPair(hand: Hand): boolean {
  if (hand.cards.length !== 2) return false;
  return hand.cards[0].rank === hand.cards[1].rank;
}

/**
 * Gets the pair value for split decisions.
 * 
 * @param hand - The hand containing a pair
 * @returns The value of the paired cards (2-11, where 11 = Ace)
 */
export function getPairValue(hand: Hand): number {
  if (!isPair(hand)) return 0;
  const value = hand.cards[0].value;
  return value === 1 ? ACE_HIGH_VALUE : value;
}

/**
 * Gets the dealer's visible card (upcard).
 * 
 * @param dealerHand - The dealer's hand
 * @returns The face-up card, or undefined if none visible
 */
export function getDealerUpcard(dealerHand: Hand): Card | undefined {
  return dealerHand.cards.find(card => card.faceUp);
}

/**
 * Gets the numeric value of the dealer's upcard.
 * 
 * @param dealerHand - The dealer's hand
 * @returns The value of the upcard (1-11), or 0 if no visible card
 */
export function getDealerUpcardValue(dealerHand: Hand): number {
  const upcard = getDealerUpcard(dealerHand);
  return upcard?.value ?? 0;
}

/**
 * Checks if a hand can receive more cards.
 * 
 * @param hand - The hand to check
 * @returns True if the hand is not busted and under 21
 */
export function canReceiveCard(hand: Hand): boolean {
  return !hand.isBusted && hand.score < BLACKJACK_SCORE;
}

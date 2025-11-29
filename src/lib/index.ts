/**
 * Library module exports.
 * Provides a single entry point for all library utilities.
 * 
 * @module lib
 */

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Deck operations
export {
  createCard,
  createSingleDeck,
  createDeck,
  shuffleDeck,
  calculateHandScore,
  createEmptyHand,
  updateHandScore,
  addCardToHand,
  revealHand,
  dealCard,
  dealCards,
  isPair,
  getPairValue,
  getDealerUpcard,
  getDealerUpcardValue,
  canReceiveCard,
  getCardImagePath,
  getExpectedCardCount,
} from './deck';

// Game rules
export {
  canHit,
  canStand,
  canDoubleDown,
  canSplit,
  canSurrender,
  shouldOfferInsurance,
  canBuyInsurance,
  getInsuranceCost,
  dealerShouldHit,
  determineWinner,
  calculatePayout,
  calculateInsurancePayout,
  calculateTotalPayout,
  getAvailableActions,
  formatScore,
  getDealerVisibleScore,
} from './blackjack';

// AI logic
export {
  getAIDecision,
  shouldAIBuyInsurance,
  getAIBetAmount,
  getStrategyDecision,
} from './ai';


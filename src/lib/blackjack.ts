/**
 * Blackjack game rules and logic.
 * Implements standard casino blackjack rules with configurable options.
 * 
 * @module lib/blackjack
 */

import { Hand, Player, Dealer, Settings, RoundResult } from '@/types/game';
import { isPair, getDealerUpcard } from './deck';
import {
  BLACKJACK_SCORE,
  DEALER_STAND_THRESHOLD,
  BLACKJACK_PAYOUT_3_2,
  BLACKJACK_PAYOUT_6_5,
  INSURANCE_PAYOUT,
  MAX_HANDS_PER_PLAYER,
} from './constants';

// =============================================================================
// ACTION VALIDATORS
// =============================================================================

/**
 * Checks if a player can hit (take another card).
 * 
 * @param hand - The player's current hand
 * @returns True if the player can hit
 */
export function canHit(hand: Hand): boolean {
  return !hand.isBusted && hand.score < BLACKJACK_SCORE;
}

/**
 * Checks if a player can stand.
 * 
 * @param hand - The player's current hand
 * @returns True if the player can stand (has at least one card)
 */
export function canStand(hand: Hand): boolean {
  return hand.cards.length > 0;
}

/**
 * Checks if a player can double down.
 * Double down is allowed on first two cards only.
 * 
 * @param hand - The player's current hand
 * @param player - The player
 * @param settings - Game settings
 * @param isSplitHand - Whether this is a hand created from a split
 * @returns True if double down is allowed
 */
export function canDoubleDown(
  hand: Hand,
  player: Player,
  settings: Settings,
  isSplitHand: boolean = false
): boolean {
  // Must have exactly 2 cards
  if (hand.cards.length !== 2) return false;
  
  // Cannot double if busted
  if (hand.isBusted) return false;
  
  // Check if player has enough chips to double
  const currentBet = player.bets[player.activeHandIndex] ?? 0;
  if (player.chips < currentBet) return false;
  
  // Check if double after split is allowed
  if (isSplitHand && !settings.allowDoubleAfterSplit) return false;
  
  return true;
}

/**
 * Checks if a player can split their hand.
 * 
 * @param hand - The player's current hand
 * @param player - The player
 * @returns True if split is allowed
 */
export function canSplit(hand: Hand, player: Player): boolean {
  // Must have exactly 2 cards that form a pair
  if (!isPair(hand)) return false;
  
  // Limit to max hands per player
  if (player.hands.length >= MAX_HANDS_PER_PLAYER) return false;
  
  // Check if player has enough chips to split
  const currentBet = player.bets[player.activeHandIndex] ?? 0;
  if (player.chips < currentBet) return false;
  
  return true;
}

/**
 * Checks if a player can surrender.
 * Surrender is allowed only on first action (before hitting).
 * 
 * @param hand - The player's current hand
 * @param player - The player
 * @param settings - Game settings
 * @returns True if surrender is allowed
 */
export function canSurrender(
  hand: Hand,
  player: Player,
  settings: Settings
): boolean {
  // Surrender must be enabled
  if (!settings.allowSurrender) return false;
  
  // Must not have taken any action yet
  if (player.hasActed) return false;
  
  // Must have exactly 2 cards
  if (hand.cards.length !== 2) return false;
  
  // Cannot surrender a blackjack
  if (hand.isBlackjack) return false;
  
  return true;
}

// =============================================================================
// INSURANCE
// =============================================================================

/**
 * Checks if insurance should be offered.
 * Insurance is offered when dealer's upcard is an Ace.
 * 
 * @param dealer - The dealer
 * @returns True if insurance should be offered
 */
export function shouldOfferInsurance(dealer: Dealer): boolean {
  const upcard = getDealerUpcard(dealer.hand);
  return upcard?.rank === 'ace';
}

/**
 * Checks if a player can buy insurance.
 * 
 * @param player - The player
 * @param dealer - The dealer
 * @returns True if the player can buy insurance
 */
export function canBuyInsurance(player: Player, dealer: Dealer): boolean {
  if (!shouldOfferInsurance(dealer)) return false;
  if (player.hasInsurance) return false;
  
  // Check if player has enough chips (insurance costs half the bet)
  const currentBet = player.bets[0] ?? 0;
  const insuranceCost = Math.floor(currentBet / 2);
  
  return player.chips >= insuranceCost;
}

/**
 * Calculates the insurance bet amount.
 * 
 * @param bet - The original bet
 * @returns Insurance cost (half the bet)
 */
export function getInsuranceCost(bet: number): number {
  return Math.floor(bet / 2);
}

// =============================================================================
// DEALER LOGIC
// =============================================================================

/**
 * Checks if the dealer should continue hitting.
 * 
 * @param dealerHand - The dealer's hand
 * @param settings - Game settings
 * @returns True if the dealer should hit
 */
export function dealerShouldHit(dealerHand: Hand, settings: Settings): boolean {
  const { score, isSoft } = dealerHand;
  
  // Dealer always hits below 17
  if (score < DEALER_STAND_THRESHOLD) return true;
  
  // Dealer always stands above 17
  if (score > DEALER_STAND_THRESHOLD) return false;
  
  // At exactly 17: hit soft 17 if setting is enabled
  if (score === DEALER_STAND_THRESHOLD && isSoft && settings.dealerHitsSoft17) {
    return true;
  }
  
  return false;
}

// =============================================================================
// RESULT DETERMINATION
// =============================================================================

/**
 * Determines the result of a hand against the dealer.
 * 
 * @param playerHand - The player's hand
 * @param dealerHand - The dealer's hand
 * @param hasSurrendered - Whether the player surrendered
 * @returns The result of the hand
 */
export function determineWinner(
  playerHand: Hand,
  dealerHand: Hand,
  hasSurrendered: boolean = false
): RoundResult {
  // Surrender is handled separately
  if (hasSurrendered) return 'surrender';
  
  // Player busted - automatic loss
  if (playerHand.isBusted) return 'lose';
  
  // Player blackjack
  if (playerHand.isBlackjack) {
    // Push if dealer also has blackjack
    if (dealerHand.isBlackjack) return 'push';
    return 'blackjack';
  }
  
  // Dealer blackjack (player doesn't have blackjack)
  if (dealerHand.isBlackjack) return 'lose';
  
  // Dealer busted - player wins
  if (dealerHand.isBusted) return 'win';
  
  // Compare scores
  if (playerHand.score > dealerHand.score) return 'win';
  if (playerHand.score < dealerHand.score) return 'lose';
  
  return 'push';
}

// =============================================================================
// PAYOUT CALCULATIONS
// =============================================================================

/**
 * Calculates the payout for a hand result.
 * 
 * @param result - The result of the hand
 * @param bet - The original bet amount
 * @param settings - Game settings
 * @returns The payout amount (positive for wins, negative for losses, 0 for push)
 */
export function calculatePayout(
  result: RoundResult,
  bet: number,
  settings: Settings
): number {
  switch (result) {
    case 'blackjack': {
      const multiplier = settings.blackjackPays === '3:2' 
        ? BLACKJACK_PAYOUT_3_2 
        : BLACKJACK_PAYOUT_6_5;
      return Math.floor(bet * multiplier);
    }
    
    case 'win':
      return bet;
    
    case 'push':
      return 0;
    
    case 'surrender':
      return -Math.floor(bet / 2);
    
    case 'lose':
    case 'pending':
    default:
      return -bet;
  }
}

/**
 * Calculates insurance payout.
 * Insurance pays 2:1 if dealer has blackjack.
 * 
 * @param insuranceBet - The insurance bet amount
 * @param dealerHasBlackjack - Whether the dealer has blackjack
 * @returns The insurance payout (positive if won, negative if lost)
 */
export function calculateInsurancePayout(
  insuranceBet: number,
  dealerHasBlackjack: boolean
): number {
  if (dealerHasBlackjack) {
    return insuranceBet * INSURANCE_PAYOUT;
  }
  return -insuranceBet;
}

/**
 * Calculates total payout for a player including all hands and insurance.
 * 
 * @param player - The player
 * @param dealerHand - The dealer's hand
 * @param settings - Game settings
 * @returns Total payout amount
 */
export function calculateTotalPayout(
  player: Player,
  dealerHand: Hand,
  settings: Settings
): number {
  let totalPayout = 0;
  
  // Calculate payout for each hand
  player.hands.forEach((hand, index) => {
    const bet = player.bets[index] ?? 0;
    const result = determineWinner(hand, dealerHand, player.hasSurrendered);
    totalPayout += calculatePayout(result, bet, settings);
  });
  
  // Add insurance payout if applicable
  if (player.hasInsurance) {
    totalPayout += calculateInsurancePayout(
      player.insuranceBet,
      dealerHand.isBlackjack
    );
  }
  
  return totalPayout;
}

// =============================================================================
// AVAILABLE ACTIONS
// =============================================================================

/** Possible player actions */
export type AvailableAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

/**
 * Gets available actions for a player.
 * 
 * @param player - The player
 * @param settings - Game settings
 * @returns Array of available actions
 */
export function getAvailableActions(
  player: Player,
  settings: Settings
): AvailableAction[] {
  const hand = player.hands[player.activeHandIndex];
  if (!hand) return [];
  
  const actions: AvailableAction[] = [];
  const isSplitHand = player.hands.length > 1;
  
  if (canHit(hand)) {
    actions.push('hit');
  }
  
  if (canStand(hand)) {
    actions.push('stand');
  }
  
  if (canDoubleDown(hand, player, settings, isSplitHand)) {
    actions.push('double');
  }
  
  if (canSplit(hand, player)) {
    actions.push('split');
  }
  
  if (canSurrender(hand, player, settings)) {
    actions.push('surrender');
  }
  
  return actions;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a score for display, including soft indicator.
 * 
 * @param hand - The hand to format
 * @returns Formatted score string
 */
export function formatScore(hand: Hand): string {
  if (hand.cards.length === 0) return '-';
  if (hand.isBlackjack) return 'Blackjack!';
  if (hand.isBusted) return 'Bust';
  if (hand.isSoft) return `Soft ${hand.score}`;
  return hand.score.toString();
}

/**
 * Gets the visible score for a dealer hand (before reveal).
 * 
 * @param dealer - The dealer
 * @returns Visible score string
 */
export function getDealerVisibleScore(dealer: Dealer): string {
  if (dealer.holeCardRevealed) {
    return formatScore(dealer.hand);
  }
  
  const upcard = getDealerUpcard(dealer.hand);
  if (!upcard) return '-';
  
  return `${upcard.value}`;
}

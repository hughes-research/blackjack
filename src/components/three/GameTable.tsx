'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Card3D, CardPlaceholder } from './Card3D';
import { Card, Hand, PLAYER_POSITIONS, DEALER_POSITION, ANIMATION_DELAYS, Settings } from '@/types/game';
import * as THREE from 'three';

interface GameTableProps {
  /** Player hands by position (0, 1, 2) */
  playerHands: Map<number, Hand[]>;
  /** Dealer's hand */
  dealerHand: Hand;
  /** Currently active player position (-1 for dealer or none) */
  activePosition: number;
  /** Active hand index for the current player (for splits) */
  activeHandIndex: number;
  /** Animation settings */
  animationSpeed: Settings['animationSpeed'];
  /** Whether the dealer's hole card is revealed */
  dealerHoleRevealed: boolean;
}

/**
 * Calculates card positions for a hand.
 * Cards are stacked with slight overlap.
 */
function getCardPositions(
  baseX: number,
  baseY: number,
  cardCount: number,
  isDealer: boolean = false
): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const cardOffset = 0.35; // Horizontal offset between cards
  
  // Center the cards around the base position
  const totalWidth = (cardCount - 1) * cardOffset;
  const startX = baseX - totalWidth / 2;
  
  for (let i = 0; i < cardCount; i++) {
    positions.push([
      startX + i * cardOffset,
      baseY,
      0.01 * i, // Slight z-offset for stacking
    ]);
  }
  
  return positions;
}

/**
 * Calculates positions for split hands.
 * Each hand is positioned side by side.
 */
function getSplitHandPositions(
  baseX: number,
  baseY: number,
  handCount: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const handSpacing = 1.5;
  
  const totalWidth = (handCount - 1) * handSpacing;
  const startX = baseX - totalWidth / 2;
  
  for (let i = 0; i < handCount; i++) {
    positions.push({
      x: startX + i * handSpacing,
      y: baseY,
    });
  }
  
  return positions;
}

/**
 * Felt texture plane for the table surface.
 */
function TableFelt() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 15]} />
      <meshStandardMaterial
        color="#2d5a3d"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Decorative table elements (betting areas, labels).
 */
function TableDecorations() {
  // Semi-circle arc for player positions
  const arcPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 4;
    const startAngle = Math.PI * 0.25;
    const endAngle = Math.PI * 0.75;
    const segments = 32;
    
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments);
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        -Math.sin(angle) * radius + 1
      ));
    }
    
    return points;
  }, []);
  
  const arcPointsArray = useMemo(() => {
    return arcPoints.map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [arcPoints]);
  
  return (
    <group>
      {/* Semi-circle betting line */}
      <Line
        points={arcPointsArray}
        color="#d4af37"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
      
      {/* Player position markers */}
      {Object.entries(PLAYER_POSITIONS).map(([pos, coords]) => (
        <group key={pos} position={[coords.x, 0.001, coords.y]}>
          {/* Betting circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.45, 32]} />
            <meshBasicMaterial color="#d4af37" opacity={0.2} transparent />
          </mesh>
        </group>
      ))}
      
      {/* Dealer position marker */}
      <group position={[DEALER_POSITION.x, 0.001, DEALER_POSITION.y]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#d4af37" opacity={0.15} transparent />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Renders a player's hand(s) on the table.
 */
interface PlayerHandsProps {
  position: number;
  hands: Hand[];
  isActive: boolean;
  activeHandIndex: number;
  animationSpeed: Settings['animationSpeed'];
}

function PlayerHandsDisplay({
  position,
  hands,
  isActive,
  activeHandIndex,
  animationSpeed,
}: PlayerHandsProps) {
  const coords = PLAYER_POSITIONS[position as keyof typeof PLAYER_POSITIONS];
  if (!coords) return null;
  
  const animDelay = ANIMATION_DELAYS[animationSpeed];
  
  // Calculate positions for split hands
  const handPositions = getSplitHandPositions(coords.x, coords.y, hands.length);
  
  return (
    <group>
      {hands.map((hand, handIndex) => {
        const handPos = handPositions[handIndex];
        const cardPositions = getCardPositions(
          handPos.x,
          handPos.y,
          hand.cards.length
        );
        
        return (
          <group key={handIndex}>
            {hand.cards.map((card, cardIndex) => (
              <Card3D
                key={card.id}
                frontTexture={card.imagePath}
                faceUp={card.faceUp}
                position={cardPositions[cardIndex]}
                animationDelay={cardIndex * animDelay}
                highlighted={isActive && handIndex === activeHandIndex}
              />
            ))}
            
            {/* Show placeholder if hand is empty */}
            {hand.cards.length === 0 && (
              <CardPlaceholder
                position={[handPos.x, handPos.y, 0]}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Renders the dealer's hand on the table.
 */
interface DealerHandProps {
  hand: Hand;
  holeRevealed: boolean;
  isActive: boolean;
  animationSpeed: Settings['animationSpeed'];
}

function DealerHandDisplay({
  hand,
  holeRevealed,
  isActive,
  animationSpeed,
}: DealerHandProps) {
  const animDelay = ANIMATION_DELAYS[animationSpeed];
  const cardPositions = getCardPositions(
    DEALER_POSITION.x,
    DEALER_POSITION.y,
    hand.cards.length,
    true
  );
  
  return (
    <group>
      {hand.cards.map((card, cardIndex) => {
        // Hole card (second card) is face down until revealed
        const isHoleCard = cardIndex === 1;
        const showFaceUp = isHoleCard ? holeRevealed : card.faceUp;
        
        return (
          <Card3D
            key={card.id}
            frontTexture={card.imagePath}
            faceUp={showFaceUp}
            position={cardPositions[cardIndex]}
            animationDelay={cardIndex * animDelay + (cardIndex > 0 ? animDelay * 3 : 0)}
            highlighted={isActive}
          />
        );
      })}
      
      {/* Placeholder if no cards */}
      {hand.cards.length === 0 && (
        <CardPlaceholder
          position={[DEALER_POSITION.x, DEALER_POSITION.y, 0]}
        />
      )}
    </group>
  );
}

/**
 * Main game table component.
 * Renders the felt surface, decorations, and all hands.
 */
export function GameTable({
  playerHands,
  dealerHand,
  activePosition,
  activeHandIndex,
  animationSpeed,
  dealerHoleRevealed,
}: GameTableProps) {
  return (
    <group>
      <TableFelt />
      <TableDecorations />
      
      {/* Player hands */}
      {[0, 1, 2].map((position) => {
        const hands = playerHands.get(position);
        if (!hands) return null;
        
        return (
          <PlayerHandsDisplay
            key={position}
            position={position}
            hands={hands}
            isActive={activePosition === position}
            activeHandIndex={activeHandIndex}
            animationSpeed={animationSpeed}
          />
        );
      })}
      
      {/* Dealer hand */}
      <DealerHandDisplay
        hand={dealerHand}
        holeRevealed={dealerHoleRevealed}
        isActive={activePosition === -1}
        animationSpeed={animationSpeed}
      />
    </group>
  );
}


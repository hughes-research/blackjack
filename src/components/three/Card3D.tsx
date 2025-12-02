'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface Card3DProps {
  /** Path to the front card image */
  frontTexture: string;
  /** Path to the back card image */
  backTexture?: string;
  /** Whether the card is face up */
  faceUp: boolean;
  /** Position in 3D space [x, y, z] */
  position: [number, number, number];
  /** Initial rotation in radians [x, y, z] */
  rotation?: [number, number, number];
  /** Scale factor */
  scale?: number;
  /** Whether to animate the card appearing */
  animateIn?: boolean;
  /** Delay before animation starts (ms) */
  animationDelay?: number;
  /** Callback when card flip completes */
  onFlipComplete?: () => void;
  /** Whether the card is highlighted (active player) */
  highlighted?: boolean;
}

/**
 * 3D playing card component using Three.js.
 * Supports flip animations, deal animations, and highlighting.
 */
export function Card3D({
  frontTexture,
  backTexture = '/cards/back.svg',
  faceUp,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  animateIn = true,
  animationDelay = 0,
  onFlipComplete,
  highlighted = false,
}: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = useState(!animateIn);
  
  // Load textures
  const frontMap = useLoader(THREE.TextureLoader, frontTexture);
  const backMap = useLoader(THREE.TextureLoader, backTexture);
  
  // Card dimensions (standard playing card ratio ~2.5:3.5)
  const cardWidth = 0.63 * scale;
  const cardHeight = 0.88 * scale;
  const cardDepth = 0.01 * scale;
  
  // Handle animation delay
  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [animateIn, animationDelay]);
  
  // Card flip animation
  const { rotationY } = useSpring({
    rotationY: faceUp ? 0 : Math.PI,
    config: { mass: 1, tension: 150, friction: 20 },
    onRest: () => {
      if (onFlipComplete) onFlipComplete();
    },
  });
  
  // Deal animation (card sliding into position)
  const { posY, opacity } = useSpring({
    posY: isVisible ? position[1] : position[1] + 2,
    opacity: isVisible ? 1 : 0,
    config: { mass: 0.5, tension: 200, friction: 20 },
  });
  
  // Highlight glow animation
  const { emissiveIntensity } = useSpring({
    emissiveIntensity: highlighted ? 0.3 : 0,
    config: { duration: 300 },
  });
  
  // Subtle hover animation
  useFrame((state) => {
    if (meshRef.current && highlighted) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });
  
  if (!isVisible && animateIn) {
    return null;
  }
  
  return (
    <animated.mesh
      ref={meshRef}
      position-x={position[0]}
      position-y={posY}
      position-z={position[2]}
      rotation-x={rotation[0]}
      rotation-y={rotationY}
      rotation-z={rotation[2]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[cardWidth, cardHeight, cardDepth]} />
      
      {/* Card edge materials */}
      <meshStandardMaterial attach="material-0" color="#f8f8f0" /> {/* Right */}
      <meshStandardMaterial attach="material-1" color="#f8f8f0" /> {/* Left */}
      <meshStandardMaterial attach="material-2" color="#f8f8f0" /> {/* Top */}
      <meshStandardMaterial attach="material-3" color="#f8f8f0" /> {/* Bottom */}
      
      {/* Front face (card front) */}
      <animated.meshStandardMaterial
        attach="material-4"
        map={frontMap}
        emissive={highlighted ? '#d4af37' : '#000000'}
        emissiveIntensity={emissiveIntensity}
      />
      
      {/* Back face (card back) */}
      <meshStandardMaterial attach="material-5" map={backMap} />
    </animated.mesh>
  );
}

/**
 * Props for a card placeholder (empty slot).
 */
interface CardPlaceholderProps {
  position: [number, number, number];
  scale?: number;
}

/**
 * Card placeholder showing where a card can be placed.
 */
export function CardPlaceholder({ position, scale = 1 }: CardPlaceholderProps) {
  const cardWidth = 0.63 * scale;
  const cardHeight = 0.88 * scale;
  
  return (
    <mesh position={position}>
      <planeGeometry args={[cardWidth, cardHeight]} />
      <meshBasicMaterial
        color="#d4af37"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}




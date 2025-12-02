'use client';

import { Suspense, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment } from '@react-three/drei';

interface CardSceneProps {
  children: ReactNode;
}

/**
 * Loading fallback component for Three.js scene.
 */
function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-casino-green-dark">
      <div className="text-gold font-display text-xl tracking-wider animate-pulse">
        Loading...
      </div>
    </div>
  );
}

/**
 * Scene lighting setup for the card table.
 */
function SceneLighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main overhead light (like casino table light) */}
      <directionalLight
        position={[0, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light from below for softer shadows */}
      <directionalLight
        position={[0, -5, 0]}
        intensity={0.2}
      />
      
      {/* Accent lights for gold highlights */}
      <pointLight
        position={[-5, 5, 5]}
        intensity={0.3}
        color="#ffd700"
      />
      <pointLight
        position={[5, 5, 5]}
        intensity={0.3}
        color="#ffd700"
      />
    </>
  );
}

/**
 * Three.js canvas wrapper for the card game scene.
 * Provides orthographic camera for overhead view and proper lighting.
 */
export function CardScene({ children }: CardSceneProps) {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          shadows
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent' }}
        >
          {/* Orthographic camera for clean overhead view */}
          <OrthographicCamera
            makeDefault
            position={[0, 10, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            zoom={80}
            near={0.1}
            far={100}
          />
          
          <SceneLighting />
          
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}

/**
 * Alternative perspective camera scene for more dramatic views.
 */
export function PerspectiveCardScene({ children }: CardSceneProps) {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          shadows
          camera={{
            position: [0, 8, 6],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
          gl={{ 
            antialias: true,
            alpha: true,
          }}
          style={{ background: 'transparent' }}
        >
          <SceneLighting />
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}




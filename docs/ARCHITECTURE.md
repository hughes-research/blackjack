# 📐 Architecture

This document describes the architecture of Blackjack Royale, including system design, component relationships, and data flow patterns.

**Author:** Dustin T Hughes  
**Developed with:** [Cursor IDE](https://cursor.sh)

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Module Structure](#module-structure)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Game Logic](#game-logic)
- [Rendering Pipeline](#rendering-pipeline)

---

## Overview

Blackjack Royale is built on a modern React architecture using Next.js 15's App Router. The application follows a clean, modular design with:

- **Centralized Constants** — All magic numbers and configuration in `lib/constants.ts`
- **Pure Utility Functions** — Reusable helpers in `lib/utils.ts`
- **Separated Business Logic** — Game rules, deck operations, and AI in dedicated modules
- **Type Safety** — Full TypeScript coverage with strict mode enabled

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | Server-side rendering, file-based routing, React Server Components |
| **Zustand for State** | Lightweight, TypeScript-friendly, no boilerplate, persistence support |
| **Modular Lib Structure** | Clear separation of concerns, easy testing, reusable logic |
| **Centralized Constants** | No magic numbers, single source of truth for configuration |

---

## System Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        subgraph "Presentation Layer"
            UI[React UI Components]
            Canvas[Three.js Canvas]
            Animations[Framer Motion]
        end
        
        subgraph "Application Layer"
            Router[Next.js App Router]
            Hooks[useBlackjack Hook]
            Store[Zustand Store]
        end
        
        subgraph "Business Logic Layer"
            Constants[lib/constants.ts]
            Utils[lib/utils.ts]
            Deck[lib/deck.ts]
            Rules[lib/blackjack.ts]
            AI[lib/ai.ts]
        end
    end
    
    subgraph "Static Assets"
        Cards[Card SVGs]
        Images[Background Images]
        Fonts[Google Fonts]
    end
    
    UI --> Hooks
    Canvas --> Hooks
    Animations --> UI
    
    Hooks --> Store
    Store --> Deck
    Store --> Rules
    Store --> AI
    
    Deck --> Constants
    Rules --> Constants
    AI --> Constants
    AI --> Utils
    
    Router --> UI
    Router --> Canvas
    
    Cards --> Canvas
    Images --> UI
    Fonts --> UI
```

---

## Module Structure

### Core Library Modules (`src/lib/`)

```mermaid
graph LR
    subgraph "lib/"
        index[index.ts<br/>Module Exports]
        constants[constants.ts<br/>Configuration]
        utils[utils.ts<br/>Helpers]
        deck[deck.ts<br/>Card Operations]
        blackjack[blackjack.ts<br/>Game Rules]
        ai[ai.ts<br/>AI Strategy]
    end
    
    index --> constants
    index --> utils
    index --> deck
    index --> blackjack
    index --> ai
    
    deck --> constants
    deck --> utils
    blackjack --> constants
    blackjack --> deck
    ai --> constants
    ai --> utils
    ai --> deck
```

### Module Responsibilities

| Module | Responsibility | Key Exports |
|--------|---------------|-------------|
| **constants.ts** | Application-wide constants, configuration values | `STARTING_CHIPS`, `MIN_BET`, `MAX_BET`, `ANIMATION_TIMING`, `BLACKJACK_SCORE` |
| **utils.ts** | Pure utility functions, formatters, type guards | `generateId`, `clamp`, `formatChips`, `updateById`, `delay` |
| **deck.ts** | Card and deck operations, hand scoring | `createDeck`, `shuffleDeck`, `dealCard`, `calculateHandScore`, `addCardToHand` |
| **blackjack.ts** | Game rules, action validators, payouts | `canHit`, `canSplit`, `determineWinner`, `calculatePayout`, `getAvailableActions` |
| **ai.ts** | AI decision making using basic strategy | `getAIDecision`, `getAIBetAmount`, `shouldAIBuyInsurance` |
| **index.ts** | Centralized exports for clean imports | Re-exports all public APIs |

---

## State Management

### Zustand Store Structure

```mermaid
stateDiagram-v2
    [*] --> idle
    
    state "Game Phases" as GamePhases {
        idle --> betting : initGame
        betting --> dealing : placeBet + startDealing
        dealing --> insurance : dealer shows Ace
        dealing --> playing : no insurance needed
        insurance --> playing : insurance resolved
        playing --> playing : hit
        playing --> dealerTurn : all players done
        dealerTurn --> payout : dealer done
        payout --> roundEnd : payouts calculated
        roundEnd --> betting : nextRound
    }
    
    playing --> playing : stand moves to next hand/player
```

### Store Slices

```typescript
interface GameState {
  // Core Game State
  players: Player[];           // All players (excluding dealer)
  dealer: Dealer;              // Dealer's hand and state
  deck: Card[];                // Current shoe (remaining cards)
  phase: GamePhase;            // Current game phase
  currentPlayerIndex: number;  // Active player's turn
  roundNumber: number;         // Current round count
  
  // Configuration
  settings: Settings;          // Game rules configuration
  
  // Statistics
  stats: SessionStats;         // Win/loss tracking
}
```

### State Updates Pattern

All state updates follow an immutable pattern:

```typescript
// ✅ Correct - Immutable update
set({
  players: players.map(p => 
    p.id === playerId 
      ? { ...p, chips: p.chips + amount }
      : p
  )
});

// Using utility function
set({
  players: updateById(players, playerId, p => ({
    ...p,
    chips: p.chips + amount
  }))
});
```

---

## Data Flow

### Unidirectional Data Flow

```mermaid
flowchart LR
    A[User Action] --> B[Component Event]
    B --> C[Zustand Action]
    C --> D[Business Logic]
    D --> E[State Update]
    E --> F[React Re-render]
    F --> G[UI Update]
    G -.-> A
```

### Action Flow Example: Hit

```mermaid
sequenceDiagram
    participant U as User
    participant C as GameControls
    participant S as Zustand Store
    participant D as deck.ts
    participant B as blackjack.ts
    
    U->>C: Click "Hit"
    C->>S: hit(playerId)
    S->>D: dealCard(deck)
    D-->>S: [card, newDeck]
    S->>D: addCardToHand(hand, card)
    D->>D: calculateHandScore()
    D-->>S: updatedHand
    S->>B: canHit(hand)?
    alt Hand busted or 21
        S->>S: nextHand(playerId)
    end
    S-->>C: Updated state
    C->>C: Re-render
```

---

## Game Logic

### Deck Operations Flow

```mermaid
flowchart TD
    A[Create Deck] --> B{Number of Decks}
    B --> C[Generate 52 × N Cards]
    C --> D[Fisher-Yates Shuffle]
    D --> E[Ready for Play]
    
    E --> F{Deal Card}
    F --> G[Pop from Deck]
    G --> H{Deck < 25%?}
    H -->|Yes| I[Create & Shuffle New Deck]
    H -->|No| J[Continue]
    I --> J
    J --> E
```

### Hand Scoring Algorithm

```mermaid
flowchart TD
    A[calculateHandScore] --> B[Sum all card values]
    B --> C[Count Aces as 11]
    C --> D{Total > 21?}
    D -->|Yes| E{Any Ace counted as 11?}
    D -->|No| F[Return Score]
    E -->|Yes| G[Reduce Ace to 1]
    E -->|No| H[Return Busted Score]
    G --> D
    F --> I{Ace still as 11?}
    I -->|Yes| J[Soft Hand]
    I -->|No| K[Hard Hand]
```

### AI Decision Flow

```mermaid
flowchart TD
    A[getAIDecision] --> B{Is Blackjack?}
    B -->|Yes| C[Stand]
    B -->|No| D{Is Pair & Can Split?}
    D -->|Yes| E[Check PAIR_STRATEGY]
    D -->|No| F{Is Soft Hand?}
    E -->|Split| G[Split]
    E -->|No Split| F
    F -->|Yes| H[Check SOFT_STRATEGY]
    F -->|No| I[Check HARD_STRATEGY]
    H --> J[Convert Decision to Action]
    I --> J
    J --> K{Decision = D?}
    K -->|Yes & Can Double| L[Double]
    K -->|Yes & Cannot| M[Hit]
    K -->|No| N[Return Action]
```

---

## Rendering Pipeline

### Component Hierarchy

```mermaid
graph TD
    App[App Layout] --> Intro[IntroScreen]
    App --> Game[GamePage]
    App --> Settings[SettingsPage]
    
    Game --> ErrorBoundary[GameErrorBoundary]
    ErrorBoundary --> VisualGameTable
    ErrorBoundary --> BettingControls
    ErrorBoundary --> GameControls
    ErrorBoundary --> ScoreBoard
    
    VisualGameTable --> DealerArea
    VisualGameTable --> PlayerAreas
    VisualGameTable --> Card2D[Card2D Components]
    
    Intro --> ParticleField[ParticleField<br/>SSR: false]
    Intro --> HeroCardStack
    Intro --> LuxuryFrame
```

### Animation Timeline (Card Deal)

```mermaid
gantt
    title Card Deal Animation Timeline
    dateFormat X
    axisFormat %Lms
    
    section Player 1
    Card 1    :0, 150
    Card 2    :400, 550
    
    section Player 2
    Card 1    :150, 300
    Card 2    :550, 700
    
    section Player 3
    Card 1    :300, 450
    Card 2    :700, 850
    
    section Dealer
    Card 1 (up)    :450, 600
    Card 2 (down)  :850, 1000
```

---

## Performance Considerations

### Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Memoization** | `useMemo` for expensive calculations, `useCallback` for handlers |
| **Lazy Loading** | Dynamic imports for 3D components with `ssr: false` |
| **Image Optimization** | Next.js Image with proper sizing and priority hints |
| **State Selectors** | Zustand `useShallow` for partial state subscriptions |
| **Pure Functions** | All lib functions are pure, enabling caching |

### Bundle Composition

```mermaid
pie title Bundle Composition (First Load JS)
    "React + Next.js Core" : 35
    "Three.js + R3F" : 25
    "Framer Motion" : 15
    "Zustand" : 3
    "Application Code" : 17
    "Other Dependencies" : 5
```

---

## Error Handling

### Error Boundary Strategy

```mermaid
flowchart TD
    A[Component Error] --> B[ErrorBoundary Catches]
    B --> C{Development Mode?}
    C -->|Yes| D[Show Error Details]
    C -->|No| E[Show User-Friendly Message]
    D --> F[Recovery Options]
    E --> F
    F --> G[Try Again]
    F --> H[Go Home]
    G --> I[Reset Error State]
    H --> J[Navigate to Home]
```

---

## Security Considerations

- **Client-side only** — No server-side game logic, no cheating concerns
- **Local storage** — Settings and stats persisted locally
- **No real money** — Educational/entertainment purpose only
- **Input validation** — All user inputs validated before state updates

---

## Future Architecture Considerations

1. **Multiplayer Support** — WebSocket integration for real-time play
2. **Backend Services** — User accounts, leaderboards, cloud saves
3. **Mobile Apps** — React Native with shared business logic
4. **Progressive Web App** — Offline support, installability

---

<p align="center">
  <a href="../README.md">← Back to README</a>
</p>

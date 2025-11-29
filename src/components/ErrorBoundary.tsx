'use client';

/**
 * Error Boundary component for catching and displaying React errors.
 * Provides graceful error handling and recovery options.
 * 
 * @module components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback component */
  fallback?: ReactNode;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
  /** Error info from React */
  errorInfo: ErrorInfo | null;
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-casino-green-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/50 backdrop-blur-sm rounded-xl border border-gold/20 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-display text-gold mb-4">
              Something Went Wrong
            </h2>
            
            <p className="text-cream/70 mb-6">
              An unexpected error occurred. Don&apos;t worry, your progress has been saved.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-gold/60 cursor-pointer hover:text-gold transition-colors">
                  Error Details
                </summary>
                <pre className="mt-2 p-3 bg-black/50 rounded text-xs text-red-400 overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-display rounded-lg hover:bg-gold-light transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <Link href="/">
                <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gold/50 text-gold font-display rounded-lg hover:bg-gold/10 transition-colors w-full">
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// HOOK FOR FUNCTIONAL COMPONENTS
// =============================================================================

/**
 * Hook to throw errors that will be caught by the nearest ErrorBoundary.
 * Useful for handling async errors in event handlers.
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null);
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// =============================================================================
// GAME-SPECIFIC ERROR BOUNDARY
// =============================================================================

interface GameErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Specialized error boundary for game components.
 * Provides game-specific recovery options.
 */
export function GameErrorBoundary({ children }: GameErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Could send to error tracking service here
        console.error('Game error:', error);
      }}
      fallback={
        <div className="min-h-screen bg-casino-green-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/50 backdrop-blur-sm rounded-xl border border-gold/20 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gold/20 rounded-full">
                <span className="text-4xl">🎰</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-display text-gold mb-4">
              Game Interrupted
            </h2>
            
            <p className="text-cream/70 mb-6">
              The game encountered an issue. Your chips and settings have been preserved.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link href="/game">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-display rounded-lg hover:bg-gold-light transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Restart Game
                </button>
              </Link>
              
              <Link href="/">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gold/50 text-gold font-display rounded-lg hover:bg-gold/10 transition-colors">
                  <Home className="w-4 h-4" />
                  Return to Menu
                </button>
              </Link>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;


'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
}

const variants = {
  primary: `
    bg-gradient-to-r from-gold-dark via-gold to-gold-dark 
    text-rich-black font-bold tracking-wider 
    shadow-gold-glow hover:shadow-gold-glow-lg
    border border-gold-shine
  `,
  secondary: `
    bg-casino-green-dark/80 
    text-gold border-2 border-gold/50 
    hover:bg-casino-green-dark hover:border-gold
  `,
  outline: `
    bg-transparent 
    text-gold border-2 border-gold/50 
    hover:bg-gold/10 hover:border-gold
  `,
  ghost: `
    bg-transparent text-gold/70 
    hover:text-gold hover:bg-gold/5
  `,
};

const sizes = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg',
};

/**
 * Styled button component with gold/green casino theme.
 * Supports multiple variants and sizes with hover animations.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`
          font-display rounded-sm transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';




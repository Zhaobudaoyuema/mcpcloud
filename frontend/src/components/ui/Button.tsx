import React from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-warm-caramel text-warm-cream hover:bg-warm-terracotta focus:ring-warm-caramel shadow-warm-sm',
  outline:
    'border border-warm-camel bg-transparent text-warm-ink hover:bg-warm-beige dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
  ghost:
    'bg-transparent text-warm-warmGray hover:bg-warm-beige dark:text-gray-300 dark:hover:bg-gray-800',
  link:
    'bg-transparent underline-offset-4 hover:underline text-warm-caramel hover:text-warm-rust',
  destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 py-2 px-4',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-12 px-6',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  variant = 'default',
  size = 'default',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-warm-btn font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
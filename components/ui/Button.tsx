import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-indigo-400/20',
        primary:
          'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30',
        destructive:
          'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50',
        outline:
          'border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-200 hover:text-white light:border-slate-300 light:text-slate-800 light:hover:bg-slate-100',
        secondary:
          'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-white/[0.08] light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-900',
        ghost:
          'hover:bg-white/[0.08] text-zinc-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100',
        link:
          'text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300 p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm rounded-xl',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-sm font-semibold',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, size, isLoading, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
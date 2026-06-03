import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75',
        className,
      )}
      {...props}
    />
  );
}

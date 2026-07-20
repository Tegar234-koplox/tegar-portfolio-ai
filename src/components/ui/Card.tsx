import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'pixel-border rounded-none bg-[#d8c7a1]/95 p-6 text-slate-900 backdrop-blur-sm dark:bg-[#2f3b32]/95 dark:text-slate-100',
        className,
      )}
      {...props}
    />
  );
}

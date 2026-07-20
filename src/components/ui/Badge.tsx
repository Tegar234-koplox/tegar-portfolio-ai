import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border-2 border-[#241b15] bg-[#e6d2a8] px-3 py-1 text-xs font-bold text-[#2b211a] shadow-[2px_2px_0_rgba(36,27,21,0.45)] dark:bg-[#485848] dark:text-[#f5f1dc]',
        className,
      )}
      {...props}
    />
  );
}

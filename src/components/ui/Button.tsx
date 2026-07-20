import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'pixel-border inline-flex items-center justify-center rounded-none bg-[#4f9d3a] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#62b948] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3f7f32] dark:hover:bg-[#4f9d3a]',
        className,
      )}
      {...props}
    />
  );
}

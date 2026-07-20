import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full resize-y rounded-none border-2 border-[#241b15] bg-[#d8f0ff] px-4 py-3 text-sm font-semibold text-[#17263a] shadow-[3px_3px_0_rgba(36,27,21,0.35)] outline-none transition placeholder:text-[#557086] focus:-translate-y-0.5 focus:border-[#2f6f28] focus:ring-4 focus:ring-[#4f9d3a]/25 dark:bg-[#233c4f] dark:text-[#f6edcf] dark:placeholder:text-[#abc2d1] dark:focus:border-[#79bd63]',
        className,
      )}
      {...props}
    />
  );
}

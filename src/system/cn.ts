import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * tailwind-merge has to know this package's own utilities, or it takes
 * `text-block` (a size) for a colour and drops `text-site-text`, or keeps
 * both `p-block` and `p-0`.
 */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['block', 'block-title'],
      radius: ['block', 'block-inner', 'site', 'site-button'],
      spacing: ['block', 'block-gap', 'control', 'control-md', 'control-lg'],
    },
  },
});

/** Joins class names; later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}

import { cn } from "@/lib/utils";

interface HarvestLogoProps {
  className?: string;
  size?: number;
}

export function HarvestLogo({ className, size = 24 }: HarvestLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-primary", className)}
      aria-hidden
    >
      <path
        d="M16 4C12 4 9 7 9 11c0 2 .5 3.5 1.5 5L16 28l5.5-12c1-1.5 1.5-3 1.5-5 0-4-3-7-7-7z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M16 6c-3 0-5.5 2.5-5.5 5.5 0 1.8.5 3.2 1.3 4.5L16 26l4.2-9.5c.8-1.3 1.3-2.7 1.3-4.5C21.5 8.5 19 6 16 6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 6V3M12 8l-2-1.5M20 8l2-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

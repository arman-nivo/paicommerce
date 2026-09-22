import { cn } from "@pai/ui";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="pai-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b63f6" />
          <stop offset=".55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#pai-g)" />
      <path d="M10 23V9h6.6c3.2 0 5.4 2 5.4 4.9s-2.2 4.9-5.4 4.9H13.4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="21.5" cy="22.5" r="2" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("font-display text-[1.15rem] font-extrabold tracking-tight", dark ? "text-white" : "text-slate-900")}>
        Pai<span className={dark ? "text-brand-300" : "text-brand-600"}>Commerce</span>
      </span>
    </span>
  );
}

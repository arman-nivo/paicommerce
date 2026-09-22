export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 20V5.5A1.5 1.5 0 0 1 7.5 4H13a5 5 0 0 1 0 10H9" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">PaiCommerce</span>
    </span>
  );
}

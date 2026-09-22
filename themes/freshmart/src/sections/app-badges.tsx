/** "Download on the App Store" / "Get it on Google Play" badges (drawn inline, no brand assets needed). */
import { SmartLink, cn } from "@pai/theme-kit";

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="currentColor">
      <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.8 1.01.08 2.05-.52 2.68-1.28z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M4.2 2.6 13.6 12l-9.4 9.4c-.3-.2-.5-.6-.5-1.1V3.7c0-.5.2-.9.5-1.1z" fill="#34d399" />
      <path d="m16.8 8.8-3.2 3.2-9.4-9.4c.3-.2.8-.2 1.2 0l11.4 6.2z" fill="#60a5fa" />
      <path d="m16.8 15.2-11.4 6.2c-.4.2-.9.2-1.2 0l9.4-9.4 3.2 3.2z" fill="#f87171" />
      <path d="m20.3 10.7-3.5-1.9-3.2 3.2 3.2 3.2 3.5-1.9c1-.6 1-2 0-2.6z" fill="#fbbf24" />
    </svg>
  );
}

export function AppBadges({ ios, android, className, tone = "dark" }: { ios?: string; android?: string; className?: string; tone?: "dark" | "light" }) {
  const cls = cn(
    "inline-flex h-12 items-center gap-2.5 rounded-xl px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current",
    tone === "dark" ? "bg-neutral-950 text-white hover:bg-neutral-800" : "bg-white text-neutral-950 hover:bg-white/90",
  );
  if (!ios && !android) return null;
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {ios ? (
        <SmartLink href={ios} className={cls} ariaLabel="Download on the App Store">
          <AppleMark />
          <span className="flex flex-col leading-none">
            <span className="text-[10px] opacity-80">Download on the</span>
            <span className="text-[15px] font-semibold">App Store</span>
          </span>
        </SmartLink>
      ) : null}
      {android ? (
        <SmartLink href={android} className={cls} ariaLabel="Get it on Google Play">
          <PlayMark />
          <span className="flex flex-col leading-none">
            <span className="text-[10px] uppercase opacity-80">Get it on</span>
            <span className="text-[15px] font-semibold">Google Play</span>
          </span>
        </SmartLink>
      ) : null}
    </div>
  );
}

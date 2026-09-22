export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-muted/60 text-foreground print:bg-white">{children}</div>;
}

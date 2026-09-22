import Link from "next/link";
import type * as React from "react";
import { buttonVariants, cn } from "@pai/ui";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Eyebrow({ children, className, dark }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        dark ? "bg-white/10 text-brand-200 ring-1 ring-white/15" : "bg-brand-50 text-brand-700 ring-1 ring-brand-600/10",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 className={cn("mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]", dark ? "text-white" : "text-foreground")}>
        {title}
      </h2>
      {description && <p className={cn("mt-4 text-base text-pretty sm:text-lg", dark ? "text-slate-300" : "text-muted-foreground")}>{description}</p>}
    </div>
  );
}

type BtnProps = {
  href: string;
  variant?: "default" | "outline" | "ghost" | "dark" | "secondary" | "white" | "glass";
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/** A link styled as a button. External / cross-app URLs use a plain <a>. */
export function ButtonLink({ href, variant = "default", size = "default", className, children, external, ...rest }: BtnProps) {
  const extra =
    variant === "white"
      ? "bg-white text-slate-900 shadow-sm hover:bg-white/90"
      : variant === "glass"
        ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
        : "";
  const cls = cn(
    buttonVariants({ variant: variant === "white" || variant === "glass" ? "ghost" : variant, size }),
    extra,
    variant === "default" && "bg-brand-600 shadow-[0_8px_24px_-8px_rgba(37,69,235,0.6)] hover:bg-brand-700",
    "rounded-xl",
    className,
  );
  const isExternal = external ?? /^https?:\/\//.test(href);
  if (isExternal)
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border bg-white", className)}>
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-300/30 via-violet-300/25 to-pink-300/25 blur-3xl" aria-hidden />
      <Container className="relative py-16 text-center sm:py-24">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>}
        {children}
      </Container>
    </section>
  );
}

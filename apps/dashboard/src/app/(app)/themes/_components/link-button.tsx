import Link from "next/link";
import { buttonVariants, cn } from "@pai/ui";

type Props = {
  href: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "link" | "dark";
  size?: "sm" | "default" | "lg" | "icon" | "icon-sm";
  external?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A link styled as a Button (avoids nesting <button> inside <a>). */
export function LinkButton({ href, variant = "default", size = "default", external, className, children }: Props) {
  const cls = cn(buttonVariants({ variant, size }), className);
  if (external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

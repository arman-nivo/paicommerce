import { Palette } from "lucide-react";
import { cn } from "@pai/ui";

/** Theme preview image with a graceful placeholder. Works in server and client components. */
export function ThemeThumb({ src, alt, className, children }: { src: string | null | undefined; alt: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 size-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <Palette className="size-8" />
        </div>
      )}
      {children}
    </div>
  );
}

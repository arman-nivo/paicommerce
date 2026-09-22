import Link from "next/link";
import { FOOTER } from "@/lib/nav";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    facebook: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z",
    youtube: "M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.5 3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.5 31 31 0 0 0-.4-4.5zM9.8 15V9l5.2 3-5.2 3z",
    linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z",
    github: "M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z",
    x: "M18.2 2.2h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.2h7l4.8 6.4 5.5-6.4zm-1.2 18h1.9L7 4.1H5z",
  };
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#070a18] text-slate-400">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="PaiCommerce home">
              <Logo dark />
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              The all-in-one commerce platform built for Bangladesh — from your first COD order to your millionth bKash payment.
            </p>
            <NewsletterForm />
            <div className="mt-6 flex gap-2">
              {Object.entries(SITE.social).map(([k, href]) => (
                <a
                  key={k}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={k}
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                >
                  <SocialIcon name={k} />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white">{col.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="transition hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PaiCommerce Technologies Ltd. Made with care in Dhaka, Bangladesh.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/status" className="inline-flex items-center gap-2 hover:text-white">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </Link>
            <span>BDT ৳ · English / বাংলা</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

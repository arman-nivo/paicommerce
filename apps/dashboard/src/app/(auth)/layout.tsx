import Link from "next/link";
import { BadgeCheck, CreditCard, Palette, Truck } from "lucide-react";
import { Logo } from "./_components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_minmax(0,640px)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/login" className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} PaiCommerce · Made for merchants in Bangladesh and beyond</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-brand-950 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(96,139,250,0.55),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.35),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <span className="size-1.5 rounded-full bg-emerald-400" /> 14-day free trial · No card required
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight">
              Your online store,
              <br />
              ready in minutes.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/70">Sell on your own website with cash on delivery, bKash & Nagad, one-click courier booking and beautiful themes — all in one place.</p>
          </div>
          <ul className="grid gap-4">
            {[
              { icon: CreditCard, title: "COD, bKash, Nagad & cards", body: "Accept every way your customers like to pay." },
              { icon: Truck, title: "Steadfast, Pathao & RedX", body: "Book couriers from the order page in one click." },
              { icon: Palette, title: "Stunning themes", body: "Customize everything with a drag-and-drop editor." },
              { icon: BadgeCheck, title: "Fraud check built in", body: "See a customer's delivery success rate before you ship." },
            ].map((f) => (
              <li key={f.title} className="flex gap-3.5 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{f.title}</span>
                  <span className="block text-sm text-white/65">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <figure className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            <blockquote className="text-sm leading-relaxed text-white/85">“We moved from a Facebook page to our own store in one evening. Orders are up 3× and courier booking takes seconds.”</blockquote>
            <figcaption className="mt-3 text-xs text-white/60">Nusrat J. — Founder, Dhaka Threads</figcaption>
          </figure>
        </div>
      </aside>
    </div>
  );
}

import Link from "next/link";
import { BookOpen, ChevronRight, Code, ExternalLink, Globe, Keyboard, Mail, MessageCircle, Palette, Phone, Smartphone, Truck } from "lucide-react";
import { WEB_URL } from "@pai/core";
import { Card, CardHeader, Kbd } from "@pai/ui";

const DOCS = [
  { href: `${WEB_URL}/docs`, label: "Help center", icon: BookOpen },
  { href: `${WEB_URL}/docs/themes`, label: "Theme guide", icon: Palette },
  { href: `${WEB_URL}/docs/api`, label: "API reference", icon: Code },
];

const GUIDES = [
  { href: "/settings/payments", label: "Set up bKash payments", hint: "Accept bKash at checkout", icon: Smartphone },
  { href: "/settings/couriers", label: "Connect Steadfast", hint: "Book deliveries in one click", icon: Truck },
  { href: "/domains", label: "Use your own domain", hint: "yourbrand.com instead of a subdomain", icon: Globe },
];

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Search & command palette" },
  { keys: ["G", "O"], label: "Go to orders" },
  { keys: ["G", "P"], label: "Go to products" },
  { keys: ["G", "C"], label: "Go to customers" },
  { keys: ["⌘", "S"], label: "Save changes" },
];

export function HelpPanel() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Documentation" />
        <div className="p-2">
          {DOCS.map((d) => (
            <a key={d.href} href={d.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted">
              <d.icon className="size-4 text-primary" />
              <span className="flex-1">{d.label}</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Quick guides" />
        <div className="p-2">
          {GUIDES.map((g) => (
            <Link key={g.href} href={g.href} className="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-muted">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <g.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{g.label}</span>
                <span className="block text-xs text-muted-foreground">{g.hint}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Talk to us" description="Saturday–Thursday, 10am–8pm (Dhaka time)" />
        <div className="space-y-2.5 p-5 text-sm">
          <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-primary">
            <MessageCircle className="size-4 text-emerald-600" /> WhatsApp: +880 1700-000000
          </a>
          <a href="tel:+8809600000000" className="flex items-center gap-3 hover:text-primary">
            <Phone className="size-4 text-primary" /> Hotline: 09600-000000
          </a>
          <a href="mailto:support@paicommerce.com" className="flex items-center gap-3 hover:text-primary">
            <Mail className="size-4 text-primary" /> support@paicommerce.com
          </a>
        </div>
      </Card>
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Keyboard className="size-4" /> Keyboard shortcuts</span>} />
        <ul className="space-y-2 p-5 text-sm">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <Kbd key={i}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

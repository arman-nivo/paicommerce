import type { Metadata } from "next";
import { Clock, Handshake, Headphones, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { Container, Eyebrow } from "@/components/site/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Talk to PaiCommerce sales, support or partnerships. We reply within one business day — or chat with us on WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const channels = [
    { icon: Headphones, t: "Sales", d: "Plans, demos and migrations", v: SITE.salesEmail, href: `mailto:${SITE.salesEmail}` },
    { icon: MessageCircle, t: "Support", d: "Help with your store, 7 days a week", v: SITE.supportEmail, href: `mailto:${SITE.supportEmail}` },
    { icon: Handshake, t: "Partnerships", d: "Agencies, theme developers, couriers", v: SITE.partnersEmail, href: `mailto:${SITE.partnersEmail}` },
  ];
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-slate-50 to-white" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid mask-fade-b opacity-50" aria-hidden />
      <Container className="relative grid gap-14 py-16 sm:py-24 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Let&apos;s grow your business together</h1>
          <p className="mt-5 text-lg text-slate-600">
            Whether you&apos;re launching your first store, moving 10,000 orders a month, or building themes — our team in Dhaka is here to help.
          </p>
          <ul className="mt-10 space-y-4">
            {channels.map(({ icon: Icon, t, d, v, href }) => (
              <li key={t}>
                <a href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{t}</span>
                    <span className="block text-sm text-slate-500">{d}</span>
                  </span>
                  <span className="ml-auto hidden text-sm font-medium text-brand-600 sm:block">{v}</span>
                </a>
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid gap-5 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <MapPin className="size-5 shrink-0 text-slate-400" />
              <div>
                <dt className="font-semibold">Office</dt>
                <dd className="text-slate-500">{SITE.address}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="size-5 shrink-0 text-slate-400" />
              <div>
                <dt className="font-semibold">Phone & WhatsApp</dt>
                <dd className="text-slate-500">{SITE.phone}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="size-5 shrink-0 text-slate-400" />
              <div>
                <dt className="font-semibold">Hours</dt>
                <dd className="text-slate-500">Sat–Thu, 9am–9pm (GMT+6)</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="size-5 shrink-0 text-slate-400" />
              <div>
                <dt className="font-semibold">General</dt>
                <dd className="text-slate-500">{SITE.email}</dd>
              </div>
            </div>
          </dl>
        </div>
        <ContactForm initialTopic={topic} />
      </Container>
    </section>
  );
}

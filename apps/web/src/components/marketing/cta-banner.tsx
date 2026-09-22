import { ArrowRight } from "lucide-react";
import { TRIAL_DAYS } from "@pai/core";
import { ButtonLink, Container } from "@/components/site/ui";
import { signupUrl } from "@/lib/site";

export function CtaBanner({
  title = "Your store could be live tonight.",
  description = `Start your ${TRIAL_DAYS}-day free trial — no credit card, no setup fee. Bring your products, pick a theme, and take your first bKash order before dinner.`,
  secondary = { label: "Talk to sales", href: "/contact" },
}: {
  title?: string;
  description?: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#070a18] px-6 py-16 text-center sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark mask-radial" aria-hidden />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600/50 via-violet-600/40 to-pink-600/40 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-balance text-white sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-slate-300">{description}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={signupUrl()} size="xl" variant="white" className="group w-full sm:w-auto">
                Start free trial <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href={secondary.href} size="xl" variant="glass" className="w-full sm:w-auto">
                {secondary.label}
              </ButtonLink>
            </div>
            <p className="mt-5 text-xs text-slate-400">Free Starter plan forever · Cancel anytime · Pay in BDT with bKash or card</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

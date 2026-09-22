import type { Metadata } from "next";
import Link from "next/link";
import { DOCS_NAV, getDocsSearchIndex } from "@/lib/docs";
import { DocsNavTree } from "@/components/docs/sidebar";
import { DocsMobileNav } from "@/components/docs/mobile-nav";
import { DocsSearchDialog, SearchTrigger } from "@/components/docs/search";
import "./docs.css";

export const metadata: Metadata = {
  title: { default: "Developer documentation", template: "%s · PaiCommerce Docs" },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const index = getDocsSearchIndex();
  return (
    <div className="relative bg-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          <aside className="hidden lg:block" aria-label="Documentation sidebar">
            <div className="no-scrollbar sticky top-16 -ml-2 h-[calc(100dvh-4rem)] overflow-y-auto border-r border-border py-8 pl-2 pr-5">
              <SearchTrigger className="mb-7" />
              <DocsNavTree nav={DOCS_NAV} />
              <div className="mt-8 rounded-xl border border-border bg-gradient-to-br from-brand-50 to-white p-4">
                <p className="text-[13px] font-semibold text-foreground">Build themes, earn 70%</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Sell premium themes to thousands of Bangladeshi merchants on the PaiCommerce Theme Store.</p>
                <Link href="/docs/themes/submitting" className="mt-3 inline-flex text-xs font-semibold text-brand-700 hover:text-brand-800">
                  Become a theme partner →
                </Link>
              </div>
            </div>
          </aside>
          <div className="min-w-0">
            <DocsMobileNav nav={DOCS_NAV} />
            {children}
          </div>
        </div>
      </div>
      <DocsSearchDialog index={index} />
    </div>
  );
}

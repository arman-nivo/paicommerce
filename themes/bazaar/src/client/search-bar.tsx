"use client";

import { useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { SearchBox, useRouter } from "@pai/theme-kit/client";

export type SearchCategory = { label: string; href: string };

/**
 * Marketplace search bar: category picker + the kit's predictive `SearchBox` + a big search button.
 * - Choosing a category jumps straight to that collection (the shopper is browsing, not typing).
 * - The button submits the search form; with an empty query and a category picked, it opens the category.
 */
export function MarketSearch({
  categories,
  placeholder,
  allLabel = "All categories",
  buttonLabel = "Search",
  showSelect = true,
  className,
}: {
  categories: SearchCategory[];
  placeholder: string;
  allLabel?: string;
  buttonLabel?: string;
  showSelect?: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [category, setCategory] = useState("");

  const submit = () => {
    const root = wrap.current;
    if (!root) return;
    const input = root.querySelector<HTMLInputElement>("input[type=search]");
    if (!input?.value.trim()) {
      if (category) router.push(category);
      else input?.focus();
      return;
    }
    root.querySelector("form")?.requestSubmit();
  };

  return (
    <div ref={wrap} className={"bz-search flex items-stretch rounded-pai-btn " + (className ?? "")}>
      {showSelect && categories.length ? (
        <label className="bz-search-cat relative hidden shrink-0 items-center lg:flex">
          <span className="sr-only">Browse a category</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value) router.push(e.target.value);
            }}
            className="h-full max-w-44 cursor-pointer appearance-none truncate bg-transparent py-0 pl-4 pr-8 text-[0.8rem] font-medium outline-none"
          >
            <option value="">{allLabel}</option>
            {categories.map((c) => (
              <option key={c.href} value={c.href}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-3.5 opacity-60" aria-hidden />
        </label>
      ) : null}
      <SearchBox placeholder={placeholder} className="bz-search-box min-w-0 flex-1" />
      <button type="button" onClick={submit} className="bz-search-btn inline-flex shrink-0 items-center justify-center gap-2 px-4 font-semibold transition sm:px-6" aria-label={buttonLabel}>
        <Search className="size-5" aria-hidden />
        <span className="hidden xl:inline">{buttonLabel}</span>
      </button>
    </div>
  );
}

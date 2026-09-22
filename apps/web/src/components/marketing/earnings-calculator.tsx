"use client";

import { useState } from "react";
import { formatMoney } from "@pai/core";

export function EarningsCalculator({ share = 70 }: { share?: number }) {
  const [price, setPrice] = useState(3900);
  const [sales, setSales] = useState(40);
  const monthly = Math.round(price * sales * (share / 100) * 100);
  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
      <p className="text-sm font-semibold text-slate-500">Earnings calculator</p>
      <label className="mt-6 block">
        <span className="flex justify-between text-sm font-medium">
          Theme price <b>{formatMoney(price * 100, "BDT")}</b>
        </span>
        <input type="range" min={1000} max={9900} step={100} value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-3 w-full accent-[#2545eb]" />
      </label>
      <label className="mt-6 block">
        <span className="flex justify-between text-sm font-medium">
          Sales per month <b>{sales}</b>
        </span>
        <input type="range" min={1} max={300} value={sales} onChange={(e) => setSales(+e.target.value)} className="mt-3 w-full accent-[#2545eb]" />
      </label>
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-5 text-white">
        <p className="text-sm text-white/80">You earn ({share}%) per month</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-tight" aria-live="polite">
          {formatMoney(monthly, "BDT")}
        </p>
        <p className="mt-1 text-sm text-white/80">≈ {formatMoney(monthly * 12, "BDT")} per year</p>
      </div>
    </div>
  );
}

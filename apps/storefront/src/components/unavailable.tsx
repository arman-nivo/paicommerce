/** Friendly page for suspended / closed stores. */
export function StoreUnavailable({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-6 text-center text-stone-900">
      <div className="max-w-md">
        {logoUrl ? <img src={logoUrl} alt={name} className="mx-auto mb-6 h-12 w-auto object-contain" /> : <p className="mb-6 text-2xl font-bold">{name}</p>}
        <h1 className="text-2xl font-semibold">This store is temporarily unavailable</h1>
        <p className="mt-3 text-stone-600">We&apos;re not taking orders right now. Please check back soon — if you placed an order, the store will contact you directly.</p>
        <p className="mt-10 text-xs text-stone-400">
          Powered by{" "}
          <a href="https://paicommerce.com" className="font-semibold underline">
            PaiCommerce
          </a>
        </p>
      </div>
    </div>
  );
}

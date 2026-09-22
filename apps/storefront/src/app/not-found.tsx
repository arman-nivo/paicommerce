import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-6 text-center font-sans text-stone-900">
      <div className="max-w-md">
        <p className="text-6xl font-bold text-stone-300">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Store not found</h1>
        <p className="mt-3 text-stone-600">We couldn&apos;t find a store at this address. Check the link, or create your own store on PaiCommerce.</p>
        <Link href={process.env.NEXT_PUBLIC_WEB_URL || "https://paicommerce.com"} className="mt-8 inline-flex rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
          Start your store with PaiCommerce
        </Link>
      </div>
    </div>
  );
}

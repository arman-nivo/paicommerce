"use client";
/**
 * @pai/theme-kit/client — interactive storefront components.
 *
 * Every component here is a Client Component styled with the theme CSS variables, and talks to the
 * storefront API through `useStorefront().api(...)`, so it works under every tenant base path
 * (subdomain, `/s/{slug}` and the customizer preview `/preview/{token}`).
 */
export { StorefrontProvider, useStorefront, useMoney, trackEvent, joinUrl } from "./storefront-context";
export type { StorefrontClientConfig, StorefrontClient, TrackEventDetail, TrackEventName } from "./storefront-context";
export { CartProvider, useCart } from "./cart";
export type { CartApi, AddToCartInput } from "./cart";
export { ToastProvider, useToast } from "./toast";
export type { ToastType } from "./toast";
export {
  ProductProvider,
  useProductForm,
  ProductPrice,
  VariantPicker,
  StockIndicator,
  QuantitySelector,
  AddToCartButton,
  BuyNowButton,
  ProductGallery,
  StickyAddToCart,
  TrackProductView,
} from "./product";
export type { ProductFormState, VariantPickerProps, QuantitySelectorProps, AddToCartButtonProps, ProductGalleryProps } from "./product";
export { CartCount, CartButton, CartDrawer, CartPageView, CartLineItem, CartTotals, DiscountForm, FreeShippingBar } from "./cart-ui";
export { SearchBox, SearchToggle } from "./search";
export type { SearchBoxProps } from "./search";
export { HeaderShell, MobileMenu, AccountLink, MenuDropdown } from "./navigation";
export { Accordion, Tabs, Carousel, Slideshow, Countdown, NewsletterForm, WishlistButton, useWishlist, ShareButtons, VideoPlayer } from "./widgets";
export type { AccordionItem, CarouselProps } from "./widgets";
export { QuickView, QuickAddButton } from "./quick-view";
export { SortSelect, CollectionFilters, FilterDrawerButton, ContactForm, LoginForm, RegisterForm, SORT_OPTIONS } from "./forms";

// Next.js navigation for theme client components (themes can't import `next/*` directly — see README).
export { default as Link } from "next/link";
export { usePathname, useRouter, useSearchParams } from "next/navigation";

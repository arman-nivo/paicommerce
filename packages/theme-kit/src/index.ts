/**
 * @pai/theme-kit — build PaiCommerce themes fast.
 *
 * - `createBaseTheme({ manifest, … })` → a complete ThemeDefinition built from the base sections.
 * - Base sections (header, hero, product, collection, cart …) you can reuse, replace or extend.
 * - Server-safe presentational components (ProductCard, Price, Section, Image …).
 * - Interactive client components live in `@pai/theme-kit/client`.
 *
 * See packages/theme-kit/README.md for the full guide.
 */

// Theme builder
export {
  createBaseTheme,
  sectionList,
  baseDefaultConfig,
  baseHeaderGroup,
  baseFooterGroup,
  baseIndexTemplate,
  baseProductTemplate,
  categoryPreset,
} from "./theme";
export type { CreateBaseThemeOptions, SectionSpec } from "./theme";

// Settings
export { baseSettingsSchema, BASE_SETTING_IDS, withSettingDefaults, extendSettingsSchema, CATEGORY_STYLES } from "./settings";

// Sections
export * from "./sections";

// Components (server-safe)
export {
  resolveHref,
  SmartLink,
  Container,
  Section,
  SectionHeading,
  Button,
  ButtonLink,
  Image,
  Placeholder,
  moneyOf,
  Price,
  Rating,
  Badge,
  RichText,
  EmptyState,
  Breadcrumbs,
  Pagination,
  withQuery,
} from "./components/primitives";
export type { SectionPadding, ButtonVariant, ButtonSize, BadgeTone } from "./components/primitives";
export { Icon, resolveIcon, ICON_OPTIONS, SocialIcon, SocialLinks, getSocialLinks, SOCIAL_LABELS, PaymentIcons, PAYMENT_ICON_IDS } from "./components/icons";
export { ProductCard, ProductGrid, ProductList, CollectionCard, ArticleCard, cardOptions } from "./components/cards";
export type { ProductCardOptions, ProductCardProps } from "./components/cards";

// Utilities
export {
  cn,
  str,
  num,
  bool,
  list,
  formatMoney,
  discountPercent,
  sanitizeHtml,
  stripHtml,
  truncate,
  aspectClass,
  gridColsClass,
  textAlignClass,
  isVideoFile,
  embedUrl,
} from "./lib/utils";
export type { CurrencyDisplay } from "./lib/utils";
export { kitCssVariables, schemeClass, luminance, readableOn } from "./lib/css";
export { listingQuery, DEFAULT_PAGE_SIZE } from "./lib/listing";
export { SAMPLE_PRODUCTS, SAMPLE_COLLECTIONS, SAMPLE_POSTS, STOCK_IMAGES, CATEGORY_HERO } from "./lib/samples";
export { EMPTY_CART, getAccountData, getStoreUrl } from "./lib/types";
export type {
  CartView,
  CartLineView,
  PredictiveSearchResult,
  AccountData,
  AccountOrderSummary,
  AccountOrderDetail,
  KitContext,
  KitContextExtras,
} from "./lib/types";

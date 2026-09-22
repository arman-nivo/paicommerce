import type { SectionDefinition } from "@pai/theme-sdk";
import { announcementBar, footer, header } from "./layout";
import { countdown, heroBanner, imageWithText, slideshow, video } from "./hero";
import { blogPosts, categoryTiles, collectionList, featuredCollection, productGrid } from "./products";
import { contactForm, customHtml, divider, faq, imageGallery, logoList, multicolumn, newsletter, richText, spacer, testimonials, trustBadges } from "./content";
import {
  main404,
  mainAccount,
  mainArticle,
  mainBlog,
  mainCart,
  mainCollection,
  mainCollectionsList,
  mainPage,
  mainProduct,
  mainSearch,
  productReviews,
  relatedProducts,
} from "./templates";

/** Every base section, keyed by its schema type. */
export const baseSectionMap = {
  "announcement-bar": announcementBar,
  header,
  footer,
  "hero-banner": heroBanner,
  slideshow,
  "image-with-text": imageWithText,
  video,
  countdown,
  "featured-collection": featuredCollection,
  "product-grid": productGrid,
  "collection-list": collectionList,
  "category-tiles": categoryTiles,
  "blog-posts": blogPosts,
  "rich-text": richText,
  multicolumn,
  "trust-badges": trustBadges,
  testimonials,
  "logo-list": logoList,
  newsletter,
  faq,
  "image-gallery": imageGallery,
  "contact-form": contactForm,
  "custom-html": customHtml,
  spacer,
  divider,
  "main-product": mainProduct,
  "product-reviews": productReviews,
  "related-products": relatedProducts,
  "main-collection": mainCollection,
  "main-collections-list": mainCollectionsList,
  "main-search": mainSearch,
  "main-cart": mainCart,
  "main-page": mainPage,
  "main-blog": mainBlog,
  "main-article": mainArticle,
  "main-account": mainAccount,
  "main-404": main404,
} satisfies Record<string, SectionDefinition<any>>;

export type BaseSectionType = keyof typeof baseSectionMap;

/** All base sections as an array (the order is the customizer's "Add section" order). */
export const baseSections: SectionDefinition<any>[] = Object.values(baseSectionMap);

export {
  announcementBar,
  header,
  footer,
  heroBanner,
  slideshow,
  imageWithText,
  video,
  countdown,
  featuredCollection,
  productGrid,
  collectionList,
  categoryTiles,
  blogPosts,
  richText,
  multicolumn,
  trustBadges,
  testimonials,
  logoList,
  newsletter,
  faq,
  imageGallery,
  contactForm,
  customHtml,
  spacer,
  divider,
  mainProduct,
  productReviews,
  relatedProducts,
  mainCollection,
  mainCollectionsList,
  mainSearch,
  mainCart,
  mainPage,
  mainBlog,
  mainArticle,
  mainAccount,
  main404,
};
export { loadMenu, Logo } from "./layout";
export { HeroText, HERO_HEIGHTS, heroPositionClasses } from "./hero";
export {
  schemeField,
  paddingField,
  headingFields,
  buttonFields,
  readButton,
  columnsField,
  mobileColumnsField,
  imageRatioField,
  productSourceFields,
  loadSectionProducts,
  PreviewNotice,
} from "./_shared";
export { extendMainProduct, ProductBlock } from "./templates";
export type { ProductBlockExtension, ProductBlockProps } from "./templates";

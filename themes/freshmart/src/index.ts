import { ProductCard, createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { listingOverrides } from "./sections/listings";

export default createBaseTheme({ manifest, overrideSections: listingOverrides(ProductCard) });

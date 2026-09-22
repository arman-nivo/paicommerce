import { csvResponse } from "@/lib/csv";

export const dynamic = "force-static";

/** GET /api/products/template — sample CSV for product import. */
export function GET() {
  return csvResponse("products-import-template.csv", [
    ["title", "description", "price", "compare_at_price", "cost", "sku", "barcode", "inventory", "status", "vendor", "type", "tags", "image_urls", "collection"],
    [
      "Cotton Panjabi — Classic White",
      "<p>Breathable 100% cotton panjabi, perfect for Eid and everyday wear.</p>",
      "1850",
      "2200",
      "1100",
      "PNJ-001",
      "",
      "25",
      "active",
      "Deshi Threads",
      "Panjabi",
      "eid, cotton, men",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1200|https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200",
      "Eid Collection",
    ],
    ["Handmade Jute Tote Bag", "Eco-friendly tote made from golden Bangladeshi jute.", "450", "", "220", "JUTE-TOTE", "", "60", "draft", "Sonali Craft", "Bags", "jute|eco|handmade", "", "Accessories"],
  ]);
}

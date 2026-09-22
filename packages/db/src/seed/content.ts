/** Store content: menus, pages and blog posts. */
import type { MenuItem } from "../schema";
import { blogPosts, menus, pages } from "../schema";
import type { Catalog } from "./catalog";
import { IMG } from "./lib/images";
import type { Rng } from "./lib/rng";
import { uuid } from "./lib/rng";
import { daysAgo, escapeHtml, formatTk, slugify } from "./lib/util";

type StoreInfo = { id: string; name: string; email: string; phone: string; addressLine: string; createdAt: Date };

const mi = (label: string, url: string, children?: MenuItem[]): MenuItem => ({ id: uuid().slice(0, 8), label, url, ...(children ? { children } : {}) });

export function buildMenus(store: StoreInfo, catalog: Catalog): (typeof menus.$inferInsert)[] {
  const cols = catalog.collections.slice(0, 5);
  return [
    {
      storeId: store.id,
      handle: "main",
      title: "Main menu",
      items: [
        mi("Home", "/"),
        mi("Shop", "/collections", [mi("All collections", "/collections"), ...cols.map((c) => mi(c.title, `/collections/${c.slug}`))]),
        ...cols.slice(0, 3).map((c) => mi(c.title, `/collections/${c.slug}`)),
        mi("Blog", "/blog"),
        mi("About", "/pages/about"),
        mi("Contact", "/pages/contact"),
      ],
    },
    {
      storeId: store.id,
      handle: "footer",
      title: "Footer menu",
      items: [
        mi("About us", "/pages/about"),
        mi("Contact", "/pages/contact"),
        mi("Track order", "/track-order"),
        mi("Privacy policy", "/pages/privacy-policy"),
        mi("Refund policy", "/pages/refund-policy"),
        mi("Terms of service", "/pages/terms"),
      ],
    },
  ];
}

export function buildPages(store: StoreInfo, catalog: Catalog): (typeof pages.$inferInsert)[] {
  const n = escapeHtml(store.name);
  const free = catalog.freeShippingOver;
  const about = catalog.about.map((p) => `<p>${escapeHtml(p.replaceAll("{store}", store.name))}</p>`).join("\n");
  const list: [string, string, string][] = [
    ["About us", "about", `<h2>Our story</h2>\n${about}\n<h2>Why shop with us</h2>\n<ul>${catalog.perks.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}<li>Cash on delivery, bKash and cards accepted</li></ul>`],
    [
      "Contact us",
      "contact",
      `<p>We'd love to hear from you. Our team replies within a few hours, 10am–10pm every day.</p>
<ul><li><strong>Phone / WhatsApp:</strong> ${store.phone}</li><li><strong>Email:</strong> ${store.email}</li><li><strong>Address:</strong> ${escapeHtml(store.addressLine)}</li><li><strong>Hours:</strong> Saturday–Thursday, 10:00am–10:00pm</li></ul>
<p>For order updates, please keep your order number handy or use the <a href="/track-order">order tracking page</a>.</p>`,
    ],
    [
      "Privacy policy",
      "privacy-policy",
      `<p>${n} respects your privacy. This policy explains what information we collect and how we use it.</p>
<h3>Information we collect</h3><p>Your name, phone number, email and delivery address when you place an order, plus basic analytics about how you use our website.</p>
<h3>How we use it</h3><p>To process and deliver your orders, send order updates by SMS or email, and improve our service. We never sell your personal data.</p>
<h3>Sharing</h3><p>We share delivery details only with our courier partners (e.g. Steadfast, Pathao) and payment details only with licensed payment gateways (bKash, SSLCommerz).</p>
<h3>Your rights</h3><p>Contact us at ${store.email} to access, correct or delete your data.</p>`,
    ],
    [
      "Refund & return policy",
      "refund-policy",
      `<p>We want you to love your order. If something isn't right, we're here to help.</p>
<ul><li>Report damaged, defective or wrong items within <strong>3 days</strong> of delivery with photos.</li><li>Eligible items can be exchanged or returned within <strong>7 days</strong>, unused and in original packaging.</li><li>Refunds are issued to your original payment method, or via bKash for cash-on-delivery orders, within 5–7 working days.</li><li>Delivery charges are non-refundable unless the item was faulty or incorrect.</li></ul>`,
    ],
    [
      "Terms of service",
      "terms",
      `<p>By using the ${n} website you agree to these terms.</p>
<h3>Orders & pricing</h3><p>All prices are in Bangladeshi Taka (BDT) and include VAT where applicable. We may cancel orders in case of pricing errors or stock issues and will notify you promptly.</p>
<h3>Delivery</h3><p>Inside Dhaka ৳70 (1–2 days), Dhaka sub-areas ৳100 (2–3 days), outside Dhaka ৳130 (3–5 days).${free ? ` Free delivery on orders over ${formatTk(free * 100)}.` : ""}</p>
<h3>Cash on delivery</h3><p>Please inspect your parcel in front of the rider. Repeated refusal of COD parcels may result in advance payment being required for future orders.</p>`,
    ],
  ];
  return list.map(([title, slug, content]) => ({ storeId: store.id, title, slug, content, published: true, createdAt: store.createdAt, updatedAt: store.createdAt, seo: { title: `${title} | ${store.name}` } }));
}

const AUTHORS = ["Editorial Team", "Nusrat Jahan", "Tanvir Ahmed", "Farhana Islam"];

export function buildBlog(store: StoreInfo, catalog: Catalog, rng: Rng): (typeof blogPosts.$inferInsert)[] {
  return catalog.blog.map((b, i) => {
    const at = daysAgo(8 + i * 17 + rng.int(0, 6));
    const content = `<p>${escapeHtml(b.excerpt)}</p>\n${b.points.map(([h, p]) => `<h2>${escapeHtml(h)}</h2>\n<p>${escapeHtml(p)}</p>`).join("\n")}\n<p>Have questions? Message the ${escapeHtml(store.name)} team any time — we're always happy to help.</p>`;
    return {
      storeId: store.id,
      title: b.title,
      slug: slugify(b.title),
      excerpt: b.excerpt,
      content,
      coverUrl: IMG[b.cover],
      author: rng.pick(AUTHORS),
      tags: b.tags,
      published: true,
      publishedAt: at,
      createdAt: at,
      updatedAt: at,
      seo: { title: b.title, description: b.excerpt, image: IMG[b.cover] },
    };
  });
}

/**
 * Folio defaults: header/footer groups and every template. Section ids are deterministic
 * (see `sectionList`) so the customizer and the storefront agree.
 */
import type { SectionList } from "@pai/theme-sdk";
import { sectionList, type SectionSpec } from "@pai/theme-kit";
import { IMG } from "./images";

/* ─────────────────────────── groups ─────────────────────────── */

type Genre = { label: string; collection?: string; link?: string; highlight?: boolean };

const BOOK_GENRES: Genre[] = [
  { label: "Bestsellers", collection: "bestsellers", highlight: true },
  { label: "Bangla Literature", collection: "bangla-literature" },
  { label: "Fiction & Poetry", collection: "english-fiction" },
  { label: "Self-help & Business", collection: "non-fiction" },
  { label: "Stationery", collection: "stationery" },
  { label: "eBooks & Courses", collection: "courses" },
];

export function headerGroup(opts: { messages: string[]; genres?: Genre[]; tagline?: string; note?: string; placeholder?: string }): SectionList {
  return sectionList([
    {
      type: "announcement-bar",
      settings: { style: "static", show_phone: true, color_scheme: "primary" },
      blocks: opts.messages.map((text) => ({ type: "announcement", settings: { text } })),
    },
    {
      type: "header",
      settings: {
        tagline: opts.tagline ?? "Booksellers · Banani, Dhaka",
        search_placeholder: opts.placeholder ?? "Search by title, author or ISBN…",
        genre_note: opts.note ?? "Free delivery inside Dhaka over ৳1,500",
        sticky: true,
        menu: "main",
      },
      blocks: (opts.genres ?? BOOK_GENRES).map((g) => ({ type: "genre", settings: { label: g.label, collection: g.collection ?? "", link: g.link ?? "", highlight: !!g.highlight } })),
    },
  ]);
}

export function footerGroup(opts: { about: string; quote: string; quoteAuthor: string; letter?: string; colophon?: string }): SectionList {
  return sectionList([
    {
      type: "footer",
      settings: {
        quote: opts.quote,
        quote_author: opts.quoteAuthor,
        colophon: opts.colophon ?? "Set in Libre Baskerville & Work Sans. Wrapped by hand in Banani, Dhaka.",
        color_scheme: "inverse",
      },
      blocks: [
        { type: "brand", settings: { text: opts.about } },
        { type: "genres", settings: { heading: "Browse", limit: 6 } },
        { type: "link_list", settings: { heading: "The shop", menu: "footer" } },
        { type: "contact", settings: { heading: "Visit & contact", hours: "Shop open daily, 10am – 9pm · Friday from 3pm" } },
        {
          type: "newsletter",
          settings: {
            heading: "The Folio Letter",
            text: opts.letter ?? "One unhurried email a month — new arrivals, booksellers' picks and invitations to our Banani reading evenings.",
            button_label: "Subscribe",
          },
        },
      ],
    },
  ]);
}

/* ─────────────────────────── shared specs ─────────────────────────── */

const trustStrip = (cols: [string, string, string][]): SectionSpec => ({
  type: "multicolumn",
  settings: { style: "icons_inline", columns: 4, padding: "small", color_scheme: "default", align: "left" },
  blocks: cols.map(([icon, title, text]) => ({ type: "column", settings: { icon, title, text } })),
});

const readerQuotes = (heading: string, quotes: [string, string, string, string][]): SectionSpec => ({
  type: "testimonials",
  settings: { eyebrow: "From our readers", heading, heading_align: "center", layout: "grid", columns: 3, color_scheme: "default" },
  blocks: quotes.map(([quote, author, location, avatar]) => ({ type: "testimonial", settings: { quote, author, location, avatar, rating: 5 } })),
});

const GITANJALI = [
  "Thou hast made me endless, such is thy pleasure. This frail vessel thou emptiest again and again, and fillest it ever with fresh life.",
  "This little flute of a reed thou hast carried over hills and dales, and hast breathed through it melodies eternally new.",
  "At the immortal touch of thy hands my little heart loses its limits in joy and gives birth to utterance ineffable.",
  "Thy infinite gifts come to me only on these very small hands of mine. Ages pass, and still thou pourest, and still there is room to fill.",
].join("\n\n");

/* ─────────────────────────── index: books (default) ─────────────────────────── */

export function booksIndex(): SectionList {
  return sectionList([
    {
      type: "folio-hero",
      settings: { media: "covers", collection: "bestsellers", caption: "On the counter this week:", height: "medium", color_scheme: "default" },
      blocks: [
        { type: "eyebrow", settings: { text: "An independent bookshop · Banani, Dhaka" } },
        { type: "heading", settings: { text: "Stories worth staying up for,", emphasis: "delivered to your door.", size: "large", tag: "h1" } },
        { type: "text", settings: { text: "From Humayun Ahmed and Satyajit Ray to Morgan Housel and rupi kaur — hand-picked Bangla literature, English fiction and ideas worth arguing about." } },
        { type: "search", settings: { placeholder: "Search by title, author or ISBN…", hint: "Try “Himu”, “Feluda”, “poetry” or “IELTS”" } },
        { type: "buttons", settings: { label_1: "Browse the bestsellers", link_1: "/collections/bestsellers", style_1: "primary", label_2: "Book of the month", link_2: "#section-book-of-the-month", style_2: "link" } },
      ],
    },
    trustStrip([
      ["truck", "Dhaka in 24 hours", "Nationwide in 2–4 days"],
      ["banknote", "Cash on delivery", "Or pay with bKash & Nagad"],
      ["gift", "Gift wrapping", "With a handwritten note"],
      ["badge-check", "Original editions", "Never photocopies"],
    ]),
    {
      type: "genre-tiles",
      settings: { eyebrow: "Find your next read", heading: "Browse by genre", style: "tiles", columns: 3, show_count: true },
      blocks: [
        { type: "genre", settings: { name: "Bangla Literature", description: "Tagore to Humayun Ahmed — the classics and the page-turners.", collection: "bangla-literature", color: "#6e1f2b" } },
        { type: "genre", settings: { name: "English Fiction & Poetry", description: "Narnia, rupi kaur and the novels everyone is talking about.", collection: "english-fiction", color: "#23395b" } },
        { type: "genre", settings: { name: "Self-help & Business", description: "Habits, money and the history of us.", collection: "non-fiction", color: "#1f4d3a" } },
        { type: "genre", settings: { name: "Stationery", description: "Dot-grid journals, fountain pens and study boxes.", collection: "stationery", color: "#a8792f", count_label: "items" } },
        { type: "genre", settings: { name: "eBooks & Courses", description: "Instant downloads and self-paced courses.", collection: "courses", color: "#3b3f8f", count_label: "titles" } },
        { type: "genre", settings: { name: "Bestsellers", description: "The books Dhaka is reading this month.", collection: "bestsellers", color: "#2b2622" } },
      ],
    },
    {
      type: "bestseller-list",
      settings: {
        eyebrow: "Updated every Friday",
        heading: "The Folio bestseller list",
        subheading: "The ten books readers across Bangladesh bought most this week — from Banani to Barishal.",
        collection: "bestsellers",
        limit: 10,
        layout: "featured",
        button_label: "See all bestsellers",
        button_link: "/collections/bestsellers",
        button_style: "secondary",
        color_scheme: "default",
      },
      blocks: [
        { type: "movement", settings: { rank: 1, change: "same" } },
        { type: "movement", settings: { rank: 2, change: "up", by: 3 } },
        { type: "movement", settings: { rank: 3, change: "up", by: 1 } },
        { type: "movement", settings: { rank: 4, change: "down", by: 2 } },
        { type: "movement", settings: { rank: 5, change: "new" } },
        { type: "movement", settings: { rank: 7, change: "down", by: 1 } },
        { type: "movement", settings: { rank: 9, change: "new" } },
      ],
    },
    {
      type: "book-of-the-month",
      settings: {
        product: "pather-panchali-bibhutibhushan-bandyopadhyay",
        eyebrow: "Book of the month · September",
        blurb:
          "<p>Nearly a century after it was first serialised, Bibhutibhushan's story of Apu and Durga growing up in a Bengal village still reads like memory rather than fiction — the monsoon, the train on the horizon, the small tragedies and enormous joys of a childhood with very little money and endless time.</p><p>If you only know it through Satyajit Ray's film, this is the month to read the book.</p>",
        quote: "Every page smells of rain on a tin roof. I finished it in two sittings and then started again.",
        reviewer: "Nabila Rahman",
        reviewer_role: "Head bookseller, Folio Banani",
        reviewer_image: IMG.reviewer,
        button_label: "Add to bag",
        sample_label: "Browse Bangla literature",
        sample_link: "/collections/bangla-literature",
        cover_position: "left",
        color_scheme: "muted",
        padding: "large",
      },
    },
    {
      type: "featured-collection",
      settings: {
        eyebrow: "The Bengal shelf",
        heading: "Bangla literature",
        subheading: "Samagras, classics and the mysteries that raised a generation of readers.",
        source: "collection",
        collection: "bangla-literature",
        limit: 8,
        columns: 4,
        layout: "grid",
      },
    },
    {
      type: "author-spotlight",
      settings: {
        eyebrow: "Author in focus",
        author: "Humayun Ahmed",
        dates: "1948 – 2012 · Novelist, dramatist, filmmaker",
        portrait: IMG.readerSilhouette,
        portrait_alt: "A young reader silhouetted against the evening sky",
        quote: "Himu walks barefoot through Dhaka in a yellow panjabi — and somehow the city makes a little more sense when he does.",
        bio: "<p>No writer has been read more widely in Bangladesh. Humayun Ahmed wrote more than two hundred books, created the unforgettable Himu and Misir Ali, and taught millions of people to love reading in their own language.</p><p>Start with <em>Himu Samagra</em> — the collected wanderings of the city's gentlest eccentric.</p>",
        source: "search",
        limit: 4,
        button_label: "All Humayun Ahmed titles",
        portrait_position: "left",
        color_scheme: "muted",
      },
    },
    {
      type: "reading-sample",
      settings: {
        eyebrow: "Read a sample",
        heading: "Open at the first page",
        intro: "Tagore's own English rendering of Gitanjali won the Nobel Prize in 1913. Read the opening song before you buy.",
        chapter: "Gitanjali · I",
        excerpt: GITANJALI,
        attribution: "From Gitanjali (Song Offerings), Rabindranath Tagore, 1912",
        product: "gitanjali-rabindranath-tagore",
        style: "spread",
        drop_cap: true,
        start_page: 1,
        button_label: "Buy Gitanjali",
        color_scheme: "default",
      },
    },
    {
      type: "digital-callout",
      settings: {
        eyebrow: "The digital shelf",
        heading: "Read tonight. Learn this weekend.",
        text: "eBooks and online courses are delivered the moment you pay with bKash, Nagad or card — no courier, no waiting.",
        formats: "PDF · EPUB · HD video lessons · Certificates",
        source: "collection",
        collection: "courses",
        limit: 3,
        layout: "products",
        button_label: "Browse eBooks & courses",
        button_link: "/collections/courses",
        button_style: "light",
        color_scheme: "inverse",
      },
      blocks: [
        { type: "feature", settings: { icon: "zap", title: "Instant delivery", text: "Your download link arrives by email and in your account seconds after payment." } },
        { type: "feature", settings: { icon: "smartphone", title: "Read on any device", text: "Phone, tablet, laptop or Kindle — PDFs and EPUBs work everywhere." } },
        { type: "feature", settings: { icon: "infinity", title: "Yours for life", text: "Lifetime course access and unlimited re-downloads." } },
      ],
    },
    {
      type: "featured-collection",
      settings: {
        eyebrow: "In English",
        heading: "Fiction & poetry",
        subheading: "From Narnia to milk and honey — the stories we keep recommending.",
        source: "collection",
        collection: "english-fiction",
        limit: 8,
        columns: 4,
        layout: "grid",
      },
    },
    readerQuotes("Read, loved, recommended", [
      ["Ordered Feluda Samagra on a Monday night and it was in Mirpur by Tuesday lunch — wrapped in brown paper with a bookmark. Proper bookshop feeling.", "Tahmid R.", "Mirpur, Dhaka", IMG.avatar2],
      ["The staff pick notes are why I keep coming back. They told me to try Pather Panchali again as an adult and they were right.", "Farzana A.", "Chattogram", IMG.avatar1],
      ["Bought the IELTS course and the grammar eBook with bKash — the links arrived instantly. Band 7.5 two months later!", "Arif H.", "Sylhet", IMG.avatar3],
    ]),
    {
      type: "blog-posts",
      settings: { eyebrow: "The Folio journal", heading: "Notes from the shop floor", limit: 3, columns: 3, show_excerpt: true, color_scheme: "default" },
    },
  ]);
}

/* ─────────────────────────── index: digital ─────────────────────────── */

export function digitalIndex(): SectionList {
  return sectionList([
    {
      type: "folio-hero",
      settings: { media: "image", image: IMG.ebookLaptop, image_alt: "An eBook open on a laptop screen", height: "medium", color_scheme: "default" },
      blocks: [
        { type: "eyebrow", settings: { text: "eBooks · Courses · Templates" } },
        { type: "heading", settings: { text: "Learn something new", emphasis: "before dinner.", size: "large", tag: "h1" } },
        { type: "text", settings: { text: "Instant-download eBooks and self-paced courses from Bangladesh's best teachers — pay with bKash or card and start in seconds." } },
        { type: "search", settings: { placeholder: "Search courses, eBooks and topics…", hint: "Try “IELTS”, “freelancing” or “grammar”" } },
        { type: "buttons", settings: { label_1: "Browse courses", link_1: "/collections/courses", style_1: "primary", label_2: "How downloads work", link_2: "#section-digital-callout", style_2: "link" } },
      ],
    },
    trustStrip([
      ["zap", "Instant access", "Seconds after payment"],
      ["wallet", "bKash & Nagad", "Cards accepted too"],
      ["smartphone", "Any device", "Phone, tablet, laptop"],
      ["infinity", "Lifetime access", "Re-download any time"],
    ]),
    {
      type: "featured-collection",
      settings: { eyebrow: "Most enrolled", heading: "Courses & eBooks", source: "collection", collection: "courses", limit: 8, columns: 4, layout: "grid" },
    },
    {
      type: "digital-callout",
      settings: {
        eyebrow: "How it works",
        heading: "No courier. No waiting.",
        text: "Checkout, and your download link and course login land in your inbox and your account immediately.",
        formats: "PDF · EPUB · HD video · Certificates of completion",
        layout: "image",
        image: IMG.studyWrite,
        image_alt: "A student taking notes beside a laptop",
        button_label: "Start learning",
        button_link: "/collections/courses",
        button_style: "primary",
        color_scheme: "muted",
      },
      blocks: [
        { type: "feature", settings: { icon: "download", title: "Download or stream", text: "Keep PDFs offline; stream lessons on any connection." } },
        { type: "feature", settings: { icon: "graduation-cap", title: "Learn at your pace", text: "Short lessons, quizzes and a certificate at the end." } },
        { type: "feature", settings: { icon: "headset", title: "Real support", text: "Stuck? Message the instructor or our team." } },
      ],
    },
    {
      type: "bestseller-list",
      settings: { eyebrow: "This month", heading: "Top downloads", subheading: "What learners are enrolling in right now.", collection: "", limit: 6, layout: "columns", show_movement: false, button_label: "" },
    },
    {
      type: "genre-tiles",
      settings: { eyebrow: "Explore", heading: "Browse by topic", style: "tiles", columns: 3, show_count: true },
      blocks: [
        { type: "genre", settings: { name: "Online courses", description: "Freelancing, IELTS and career skills.", collection: "courses", color: "#4338ca", count_label: "courses" } },
        { type: "genre", settings: { name: "Self-help & Business", description: "Books that pair with every course.", collection: "non-fiction", color: "#0e7490" } },
        { type: "genre", settings: { name: "Study stationery", description: "Journals and pens for note-takers.", collection: "stationery", color: "#0f172a", count_label: "items" } },
      ],
    },
    readerQuotes("Learners love it", [
      ["The IELTS course is structured brilliantly and I could watch on my phone during my commute. Band 7.5!", "Arif H.", "Sylhet", IMG.avatar3],
      ["Paid with bKash at midnight and started the freelancing course straight away. My first client came three weeks later.", "Tahmid R.", "Dhaka", IMG.avatar2],
      ["Clear, affordable and in Bangla where it matters. The grammar eBook is on my phone permanently.", "Farzana A.", "Rajshahi", IMG.avatar1],
    ]),
    {
      type: "faq",
      settings: { heading: "Downloads & access", layout: "split", color_scheme: "default" },
      blocks: [
        { type: "question", settings: { question: "When do I get my eBook or course?", answer: "<p>Immediately. As soon as your payment is confirmed, the download link or course login is emailed to you and appears in your account.</p>" } },
        { type: "question", settings: { question: "Which devices can I use?", answer: "<p>Any phone, tablet or computer. PDFs and EPUBs also work on Kindle and most e-readers.</p>" } },
        { type: "question", settings: { question: "How do I pay?", answer: "<p>bKash, Nagad, Rocket or any Visa/Mastercard. Digital products can't be paid by cash on delivery.</p>" } },
        { type: "question", settings: { question: "Can I download again later?", answer: "<p>Yes — your purchases stay in your account for life, and you can re-download them whenever you need.</p>" } },
      ],
    },
    { type: "blog-posts", settings: { eyebrow: "Guides", heading: "Study notes & guides", limit: 3, columns: 3 } },
  ]);
}

/* ─────────────────────────── index: general ─────────────────────────── */

export function generalIndex(): SectionList {
  return sectionList([
    {
      type: "folio-hero",
      settings: { media: "image", image: IMG.bookCoffee, image_alt: "An open book beside a cup of coffee and reading glasses", height: "medium", media_position: "right" },
      blocks: [
        { type: "eyebrow", settings: { text: "Books · Stationery · Gifts" } },
        { type: "heading", settings: { text: "Thoughtful things for", emphasis: "curious people.", size: "large", tag: "h1" } },
        { type: "text", settings: { text: "A carefully chosen shop of books, beautiful stationery and small gifts — cash on delivery anywhere in Bangladesh." } },
        { type: "search", settings: { placeholder: "What are you looking for?", hint: "" } },
        { type: "buttons", settings: { label_1: "Shop everything", link_1: "/collections/all", style_1: "primary", label_2: "Browse collections", link_2: "/collections", style_2: "link" } },
      ],
    },
    trustStrip([
      ["truck", "Nationwide delivery", "All 64 districts"],
      ["banknote", "Cash on delivery", "Pay when it arrives"],
      ["gift", "Gift wrapping", "Add a note at checkout"],
      ["rotate-ccw", "Easy returns", "Within 7 days"],
    ]),
    {
      type: "genre-tiles",
      settings: { eyebrow: "Shop by department", heading: "Something for every shelf", style: "spines", show_count: true },
      blocks: [
        { type: "genre", settings: { name: "Bestsellers", collection: "bestsellers", color: "#1f4d3a" } },
        { type: "genre", settings: { name: "Bangla", collection: "bangla-literature", color: "#7a2e2a" } },
        { type: "genre", settings: { name: "Fiction", collection: "english-fiction", color: "#23395b" } },
        { type: "genre", settings: { name: "Ideas", collection: "non-fiction", color: "#b7813a" } },
        { type: "genre", settings: { name: "Stationery", collection: "stationery", color: "#3d3a35", count_label: "items" } },
        { type: "genre", settings: { name: "Courses", collection: "courses", color: "#5b6b4a", count_label: "courses" } },
      ],
    },
    { type: "featured-collection", settings: { eyebrow: "Just in", heading: "New arrivals", source: "newest", limit: 8, columns: 4, layout: "grid" } },
    {
      type: "book-of-the-month",
      settings: {
        product: "atomic-habits-james-clear",
        eyebrow: "Staff pick",
        blurb: "<p>The most practical book we sell. Tiny changes, compounding every day — and a system you can actually keep.</p>",
        quote: "I've bought this for four friends. Chapter three alone is worth the price.",
        reviewer: "Rafi Chowdhury",
        reviewer_role: "Shop manager",
        sample_label: "",
        color_scheme: "muted",
      },
    },
    { type: "featured-collection", settings: { eyebrow: "The writing desk", heading: "Stationery", source: "collection", collection: "stationery", limit: 4, columns: 4, layout: "grid" } },
    { type: "bestseller-list", settings: { heading: "Best sellers", eyebrow: "This week", collection: "bestsellers", limit: 6, layout: "columns", show_movement: false, button_label: "Shop best sellers", button_link: "/collections/bestsellers" } },
    readerQuotes("Happy customers", [
      ["Beautifully packed and delivered to Khulna in three days. The journal is gorgeous.", "Sumaiya K.", "Khulna", IMG.avatar1],
      ["Cash on delivery, polite rider and a handwritten thank-you note. Lovely shop.", "Tahmid R.", "Dhaka", IMG.avatar2],
      ["Bought a fountain pen set as a gift — it arrived gift-wrapped exactly as I asked.", "Arif H.", "Sylhet", IMG.avatar3],
    ]),
    { type: "blog-posts", settings: { eyebrow: "Journal", heading: "Stories & guides", limit: 3, columns: 3 } },
  ]);
}

/* ─────────────────────────── other templates ─────────────────────────── */

export function productTemplate(): SectionList {
  return sectionList([
    {
      type: "main-product",
      settings: { gallery_layout: "thumbnails-left", image_ratio: "portrait", media_width: "medium", zoom: true, sticky_info: true, sticky_atc: true, show_breadcrumbs: true },
      blocks: [
        { type: "vendor" },
        { type: "title", settings: { show_author: true } },
        { type: "rating" },
        { type: "price" },
        { type: "variant_picker", settings: { style: "buttons" } },
        { type: "stock" },
        { type: "buy_buttons", settings: { show_quantity: true, show_buy_now: true, buy_now_style: "secondary" } },
        { type: "save_for_later" },
        { type: "digital_delivery" },
        { type: "delivery_info", settings: { inside_text: "Delivery in 24 hours · ৳60", outside_text: "Delivery in 2–4 days · ৳120", note: "Cash on delivery, bKash and Nagad accepted." } },
        { type: "description", settings: { collapsed: false } },
        { type: "book_details" },
        { type: "collapsible_tab", settings: { heading: "Delivery & returns", icon: "truck", content: "<p>Inside Dhaka: within 24 hours. Outside Dhaka: 2–4 days by courier. Printed books can be returned within 7 days if damaged or misprinted. Digital products are delivered instantly and are non-refundable once downloaded.</p>" } },
        { type: "collapsible_tab", settings: { heading: "Gift wrapping", icon: "gift", content: "<p>Add a note at checkout and we'll wrap your book in kraft paper with a handwritten card — free on every order.</p>" } },
        { type: "share" },
      ],
    },
    { type: "product-reviews" },
    { type: "related-products", settings: { heading: "Readers also bought", limit: 5, columns: 5 } },
  ]);
}

export function templates() {
  return {
    product: productTemplate(),
    collection: sectionList([{ type: "main-collection", settings: { columns: 5, filters: "sidebar", show_banner: false, per_page: 24 } }]),
    collections: sectionList([{ type: "main-collections-list" }]),
    search: sectionList([{ type: "main-search", settings: { columns: 5 } }]),
    cart: sectionList([
      { type: "main-cart" },
      { type: "featured-collection", settings: { eyebrow: "Before you go", heading: "Add one more for the pile", source: "best-selling", limit: 5, columns: 5, layout: "grid" } },
    ]),
    page: sectionList([{ type: "main-page" }]),
    blog: sectionList([{ type: "main-blog" }]),
    article: sectionList([
      { type: "main-article" },
      { type: "featured-collection", settings: { heading: "Books from this story", source: "best-selling", limit: 5, columns: 5, layout: "grid" } },
    ]),
    account: sectionList([{ type: "main-account" }]),
    "404": sectionList([
      { type: "main-404", settings: { heading: "This page has gone out of print", text: "The page you were looking for isn't on our shelves. Try a search, or browse what readers are loving this week." } },
    ]),
  };
}

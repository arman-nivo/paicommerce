import type { Catalog } from "./types";

const FORMAT = { name: "Format", values: ["Paperback", "Hardcover"] };

export const books: Catalog = {
  key: "books",
  vendor: "Folio",
  freeShippingOver: 1000,
  qty: [[1, 65], [2, 25], [3, 10]],
  collections: [
    { slug: "bestsellers", title: "Bestsellers", description: "The books everyone in Bangladesh is reading right now.", img: "booksRow", sortOrder: "best-selling" },
    { slug: "bangla-literature", title: "Bangla Literature", description: "Classics and contemporary favourites from Bengal's greatest writers.", img: "oldBooks" },
    { slug: "english-fiction", title: "English Fiction & Poetry", description: "Novels, fantasy and poetry from around the world.", img: "fantasyBook" },
    { slug: "non-fiction", title: "Self-help & Business", description: "Money, habits, productivity and big ideas.", img: "bizBooks" },
    { slug: "stationery", title: "Stationery", description: "Journals, pens and desk essentials for writers and students.", img: "notesPen" },
    { slug: "courses", title: "Online Courses & eBooks", description: "Instant-access digital learning — delivered to your inbox.", img: "laptopBook" },
  ],
  products: [
    { t: "The Psychology of Money — Morgan Housel", price: 650, img: ["financeBook", "bookCoffee"], type: "Book", col: ["bestsellers", "non-fiction"], feat: true, pop: 3, d: "Timeless lessons on wealth, greed and happiness told through 19 short stories.", specs: [["Author", "Morgan Housel"], ["Pages", "256"], ["Language", "English"]], opt: [FORMAT], delta: { Hardcover: 450 }, tags: ["finance", "bestseller"] },
    { t: "milk and honey — rupi kaur", price: 550, img: ["poetryBook"], type: "Book", col: ["english-fiction", "bestsellers"], feat: true, pop: 2, d: "A collection of poetry and prose about survival, love and femininity.", specs: [["Author", "rupi kaur"], ["Pages", "208"]], stock: [10, 40], tags: ["poetry"] },
    { t: "The Chronicles of Narnia (Complete Edition)", price: 1450, img: ["fantasyBook", "glowBook"], type: "Book", col: ["english-fiction"], pop: 1.2, d: "All seven books of C.S. Lewis' classic fantasy in one illustrated volume.", specs: [["Author", "C.S. Lewis"], ["Pages", "784"]], stock: [5, 20], tags: ["fantasy", "classic"] },
    { t: "Startup Classics Bundle (4 Books)", price: 2450, cmp: 2950, img: ["bizBooks"], type: "Bundle", col: ["non-fiction"], pop: 1, d: "Zero to One, The Lean Startup, The Hard Thing About Hard Things and Ego Is the Enemy.", stock: [5, 20], tags: ["business", "bundle"] },
    { t: "Himu Samagra — Humayun Ahmed", price: 950, img: ["colorStack", "openStack"], type: "Book", col: ["bangla-literature", "bestsellers"], feat: true, pop: 2.5, d: "The complete adventures of Himu, the yellow-panjabi-clad wanderer of Dhaka.", specs: [["Author", "Humayun Ahmed"], ["Language", "Bangla"]], stock: [10, 40], tags: ["bangla", "humayun-ahmed"] },
    { t: "Feluda Samagra Vol. 1 — Satyajit Ray", price: 1150, img: ["stackPlant", "readingLap"], type: "Book", col: ["bangla-literature"], pop: 1.5, d: "Kolkata's favourite detective in his first ten cases.", specs: [["Author", "Satyajit Ray"], ["Language", "Bangla"]], stock: [5, 25], tags: ["bangla", "mystery"] },
    { t: "Pather Panchali — Bibhutibhushan Bandyopadhyay", price: 450, img: ["oldBooks", "bookGrass"], type: "Book", col: ["bangla-literature"], pop: 1, d: "The luminous coming-of-age classic of rural Bengal.", specs: [["Language", "Bangla"], ["Pages", "320"]], stock: [5, 25], tags: ["bangla", "classic"] },
    { t: "Gitanjali — Rabindranath Tagore", price: 550, img: ["leatherShelf", "pagesFan"], type: "Book", col: ["bangla-literature", "english-fiction"], pop: 1.2, d: "The Nobel-winning song offerings, bilingual Bangla–English edition.", opt: [FORMAT], delta: { Hardcover: 350 }, tags: ["poetry", "tagore"] },
    { t: "Atomic Habits — James Clear", price: 750, img: ["windowStack", "readingLap"], type: "Book", col: ["non-fiction", "bestsellers"], feat: true, pop: 3, d: "An easy and proven way to build good habits and break bad ones.", specs: [["Author", "James Clear"], ["Pages", "320"]], opt: [FORMAT], delta: { Hardcover: 400 }, tags: ["self-help", "bestseller"] },
    { t: "Sapiens — Yuval Noah Harari", price: 950, img: ["handStack", "tallStack"], type: "Book", col: ["non-fiction"], pop: 1.5, d: "A brief history of humankind.", specs: [["Author", "Yuval Noah Harari"], ["Pages", "512"]], stock: [5, 25], tags: ["history"] },
    { t: "Little Readers Picture Book Box (5 books)", price: 1650, img: ["appleBooks", "letteringBook"], type: "Children's Books", col: ["english-fiction"], pop: 1, d: "Five illustrated stories for ages 3–7, in Bangla and English.", stock: [5, 20], tags: ["kids", "gift"] },
    { t: "Hardcover Dot-Grid Journal (A5)", price: 650, img: ["notebook", "notesPen"], type: "Journal", col: ["stationery"], feat: true, pop: 2, d: "120 gsm ivory paper, 192 pages, lay-flat binding.", opt: [{ name: "Color", values: ["Black", "Sage", "Terracotta"] }], tags: ["journal"] },
    { t: "Fountain Pen Gift Set", price: 1850, img: ["fountainPen", "parkerPen"], type: "Pen", col: ["stationery"], pop: 1, d: "Steel-nib fountain pen with converter and ink cartridges.", stock: [5, 20], tags: ["gift", "pen"] },
    { t: "Student Stationery Box", price: 950, img: ["stationeryBox"], type: "Stationery", col: ["stationery"], pop: 1.5, d: "Highlighters, gel pens, sticky notes and a ruler — exam ready.", stock: [10, 30], tags: ["student"] },
    { t: "Minimal Gel Pen Pack (10)", price: 350, img: ["blackPen"], type: "Pen", col: ["stationery"], pop: 2, d: "Smooth 0.5 mm black gel pens.", stock: [20, 60], tags: ["pen"] },
    { t: "Freelancing Masterclass (Online Course)", price: 2990, cmp: 4990, img: ["laptopBook", "students"], type: "Online Course", col: ["courses"], feat: true, digital: true, pop: 1.5, d: "Land your first client on Upwork & Fiverr — 40 video lessons in Bangla.", specs: [["Format", "Video, lifetime access"], ["Language", "Bangla"], ["Certificate", "Yes"]], tags: ["course", "freelancing"] },
    { t: "IELTS Band 7+ Preparation Course", price: 4500, img: ["classroom", "studyWrite"], type: "Online Course", col: ["courses"], digital: true, pop: 1, d: "Live classes, mock tests and speaking practice with certified trainers.", specs: [["Duration", "8 weeks"], ["Format", "Live + recorded"]], tags: ["course", "ielts"] },
    { t: "Bangla Grammar Made Easy (eBook, PDF)", price: 290, img: ["studyWrite", "pagesFan"], type: "eBook", col: ["courses"], digital: true, pop: 1.2, d: "A clear, example-led guide for SSC and HSC students.", tags: ["ebook", "student"] },
  ],
  blog: [
    { title: "10 Bangla Novels Everyone Should Read", excerpt: "From Pather Panchali to Humayun Ahmed's Himu — our editors' essential list.", cover: "oldBooks", tags: ["reading-list", "bangla"],
      points: [["The classics", "Pather Panchali and Padma Nadir Majhi capture rural Bengal like no other."], ["Modern favourites", "Humayun Ahmed's Himu and Misir Ali series never get old."], ["Mystery", "Satyajit Ray's Feluda is perfect for teens and adults alike."]] },
    { title: "How to Build a Daily Reading Habit", excerpt: "Twenty pages a day adds up to 30 books a year. Here's how to make it stick.", cover: "readingLap", tags: ["habits"],
      points: [["Stack it", "Read right after your morning tea."], ["Carry a book", "Replace a scroll session with a chapter."], ["Track it", "A simple reading journal keeps you motivated."]] },
    { title: "Ekushey Boi Mela 2026: What We're Excited About", excerpt: "New releases, author signings and where to find our stall.", cover: "bookMarket", tags: ["events", "boi-mela"],
      points: [["New releases", "Twelve new Bangla titles from debut authors."], ["Signings", "Weekend author meet-and-greets at our stall."], ["Online", "Can't make it? Order Boi Mela titles here with free delivery."]] },
  ],
  about: [
    "{store} began as a tiny bookstall at Nilkhet and is now one of Bangladesh's favourite online bookstores, with over 50,000 titles in Bangla and English.",
    "We believe every home deserves a bookshelf. That's why we keep prices fair and deliver to every district.",
    "Our online courses and eBooks are delivered instantly to your email after payment.",
  ],
  perks: ["Original prints only", "Free delivery over ৳1,000"],
  reviews: [
    "Original print, great paper quality.", "Book arrived in perfect condition.", "Loved it, couldn't put it down.", "Great price compared to other shops.",
    "Fast delivery, well packed.", "Bought as a gift, they loved it.", "Very helpful course, clear explanations.",
  ],
};

/**
 * Folio's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/folio`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Libraries, shelves & reading
  library: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570${q}&w=2000`,
  curvedLibrary: `https://images.unsplash.com/photo-1524995997946-a1c2e315a42f${q}&w=1800`,
  ladderLibrary: `https://images.unsplash.com/photo-1535905557558-afc4877a26fc${q}&w=1600`,
  vintageShelf: `https://images.unsplash.com/photo-1507842217343-583bb7270b66${q}&w=1600`,
  bookstore: `https://images.unsplash.com/photo-1526243741027-444d633d7365${q}&w=1600`,
  bookMarket: `https://images.unsplash.com/photo-1463320726281-696a485928c7${q}&w=1600`,
  shelfHand: `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0${q}&w=1400`,
  antiqueSpines: `https://images.unsplash.com/photo-1474932430478-367dbb6832c1${q}&w=1400`,
  colourStack: `https://images.unsplash.com/photo-1550399105-c4db5fb85c18${q}&w=1400`,
  booksRow: `https://images.unsplash.com/photo-1495446815901-a7297e633e8d${q}&w=1400`,
  bookEdges: `https://images.unsplash.com/photo-1470549638415-0a0755be0619${q}&w=1400`,
  openLibraryBook: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8${q}&w=1600`,
  pagesFan: `https://images.unsplash.com/photo-1589998059171-988d887df646${q}&w=1400`,
  pagesWall: `https://images.unsplash.com/photo-1457369804613-52c61a468e7d${q}&w=1600`,
  readingLap: `https://images.unsplash.com/photo-1506880018603-83d5b814b5a6${q}&w=1400`,
  readerSilhouette: `https://images.unsplash.com/photo-1491841550275-ad7854e35ca6${q}&w=1400`,
  bookCoffee: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c${q}&w=1400`,
  bookMist: `https://images.unsplash.com/photo-1541963463532-d68292c34b19${q}&w=1400`,
  glowBook: `https://images.unsplash.com/photo-1519791883288-dc8bd696e667${q}&w=1400`,
  bookGrass: `https://images.unsplash.com/photo-1476275466078-4007374efbbe${q}&w=1400`,
  magicLibrary: `https://images.unsplash.com/photo-1532012197267-da84d127e765${q}&w=1400`,
  // Stationery & writing
  fountainPen: `https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3${q}&w=1400`,
  journalCoffee: `https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e${q}&w=1400`,
  notesPen: `https://images.unsplash.com/photo-1517842645767-c639042777db${q}&w=1400`,
  letteringBook: `https://images.unsplash.com/photo-1515098506762-79e1384e9d8e${q}&w=1400`,
  // Digital & learning
  ebookLaptop: `https://images.unsplash.com/photo-1504691342899-4d92b50853e1${q}&w=1600`,
  laptopBook: `https://images.unsplash.com/photo-1501504905252-473c47e087f8${q}&w=1400`,
  studyWrite: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173${q}&w=1400`,
  students: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f${q}&w=1400`,
  // People (testimonials / reviewer)
  reviewer: `https://images.unsplash.com/photo-1488426862026-3ee34a7d66df${q}&w=240`,
  avatar1: `https://images.unsplash.com/photo-1580489944761-15a19d654956${q}&w=200`,
  avatar2: `https://images.unsplash.com/photo-1566492031773-4f4e44671857${q}&w=200`,
  avatar3: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d${q}&w=200`,
};

import type { Catalog } from "./types";

const RING = { name: "Ring Size", values: ["6", "7", "8"] };

export const jewelry: Catalog = {
  key: "jewelry",
  vendor: "Lumière",
  freeShippingOver: 0,
  qty: [[1, 95], [2, 5]],
  collections: [
    { slug: "rings", title: "Rings", description: "Solitaires, cocktail rings and everyday stackers.", img: "diamondRing" },
    { slug: "necklaces", title: "Necklaces & Pendants", description: "From delicate chains to heirloom statement pieces.", img: "pendantGold" },
    { slug: "earrings", title: "Earrings", description: "Studs, hoops and drops to frame your face.", img: "sapphireEarrings" },
    { slug: "bracelets-bangles", title: "Bracelets & Bangles", description: "Tennis bracelets, chains and traditional 22K bangles.", img: "roseBracelet" },
    { slug: "watches", title: "Watches", description: "Automatic and chronograph timepieces.", img: "watchLuxury" },
    { slug: "bridal", title: "Bridal", description: "Heirloom pieces for the most important day of your life.", img: "templeNecklace" },
  ],
  products: [
    { t: "18K Gold Halo Diamond Ring", price: 145000, img: ["diamondRing", "stackRings"], type: "Ring", col: ["rings", "bridal"], feat: true, pop: 1, d: "A brilliant-cut centre diamond framed by a halo of pavé diamonds on a split shank.", specs: [["Metal", "18K white gold"], ["Centre stone", "0.50 ct, VS1, G"], ["Certificate", "IGI certified"]], opt: [RING], stock: [1, 3], tags: ["diamond", "engagement"] },
    { t: "Pink Sapphire Cocktail Ring", price: 68500, img: ["pinkRing"], type: "Ring", col: ["rings"], pop: 0.8, d: "An emerald-cut pink sapphire surrounded by micro-pavé diamonds.", specs: [["Metal", "18K rose gold"], ["Gem", "Pink sapphire 1.2 ct"]], opt: [RING], stock: [1, 3], tags: ["sapphire"] },
    { t: "Classic Solitaire Engagement Ring", price: 125000, img: ["solitaire", "gemRings"], type: "Ring", col: ["rings", "bridal"], feat: true, pop: 1, d: "An emerald-cut solitaire on a slim pavé band — timeless.", specs: [["Metal", "18K yellow gold"], ["Stone", "0.70 ct lab-grown diamond"]], opt: [RING], stock: [1, 3], tags: ["engagement", "solitaire"] },
    { t: "Stacked Diamond Ring Trio", price: 38500, img: ["stackRings", "gemRings"], type: "Ring", col: ["rings"], pop: 1.5, d: "Three textured gold bands with diamond accents — wear together or apart.", specs: [["Metal", "18K yellow gold"]], opt: [RING], stock: [2, 6], tags: ["stacking"] },
    { t: "Amethyst & Citrine Flower Ring", price: 42500, img: ["amethystRing"], type: "Ring", col: ["rings"], pop: 0.7, d: "A floral cocktail ring with pear-cut amethysts and citrines.", specs: [["Metal", "Sterling silver, rhodium plated"]], opt: [RING], stock: [1, 4], tags: ["gemstone"] },
    { t: "Freshwater Pearl Necklace", price: 24500, img: ["pearls"], type: "Necklace", col: ["necklaces", "bridal"], feat: true, pop: 1.5, d: "Hand-knotted AAA freshwater pearls with a diamond clasp.", specs: [["Length", "45 cm"], ["Pearl size", "7–7.5 mm"]], stock: [2, 6], tags: ["pearl", "gift"] },
    { t: "22K Gold Temple Necklace Set", price: 285000, img: ["templeNecklace", "goldBangles"], type: "Necklace Set", col: ["necklaces", "bridal"], feat: true, pop: 0.6, d: "An heirloom 22K gold necklace with ruby accents and matching jhumka earrings.", specs: [["Metal", "22K hallmarked gold"], ["Weight", "approx. 32 g"]], stock: [1, 2], tags: ["22k", "bridal", "gold"] },
    { t: "Cushion-Cut Diamond Pendant", price: 95000, img: ["cushionPendant"], type: "Pendant", col: ["necklaces"], pop: 0.7, d: "A cushion halo pendant on a fine box chain.", specs: [["Metal", "18K white gold"], ["Diamonds", "0.60 ct total"]], stock: [1, 3], tags: ["diamond"] },
    { t: "Heart Pavé Pendant", price: 32500, img: ["heartPendant"], type: "Pendant", col: ["necklaces"], pop: 1.3, d: "An open heart outlined with sparkling pavé.", specs: [["Metal", "18K white gold"]], stock: [2, 6], tags: ["gift", "heart"] },
    { t: "Dainty Gold Chain Necklace", price: 18500, img: ["necklaceNeck", "dropNecklace"], type: "Necklace", col: ["necklaces"], pop: 2, d: "A whisper-thin chain with a single bezel-set stone — made for everyday.", specs: [["Metal", "18K yellow gold"], ["Length", "40 + 5 cm"]], stock: [3, 8], tags: ["everyday"] },
    { t: "Art-Deco Sapphire Drop Earrings", price: 78500, img: ["sapphireEarrings"], type: "Earrings", col: ["earrings", "bridal"], pop: 0.6, d: "Pear-cut sapphires set in an art-deco diamond frame.", specs: [["Metal", "18K white gold"]], stock: [1, 3], tags: ["sapphire"] },
    { t: "Twisted Gold Hoops", price: 21500, img: ["twistHoops", "goldHoop"], type: "Earrings", col: ["earrings"], feat: true, pop: 2, d: "Chunky twisted hoops that catch the light.", specs: [["Metal", "18K yellow gold"], ["Diameter", "22 mm"]], stock: [3, 8], tags: ["hoops"] },
    { t: "Filigree Gold Studs", price: 24500, img: ["goldStuds"], type: "Earrings", col: ["earrings"], pop: 1.2, d: "Hand-worked filigree studs with a champagne diamond centre.", specs: [["Metal", "22K gold"]], stock: [2, 6], tags: ["22k"] },
    { t: "Diamond Huggie Hoops", price: 29500, img: ["hoopEar"], type: "Earrings", col: ["earrings"], pop: 1.2, d: "Pavé huggies that sit close to the lobe.", specs: [["Metal", "18K white gold"]], stock: [2, 6], tags: ["diamond"] },
    { t: "Rose Gold Infinity Bracelet", price: 36500, img: ["roseBracelet"], type: "Bracelet", col: ["bracelets-bangles"], pop: 1.2, d: "Interlocking infinity links set with tiny diamonds.", specs: [["Metal", "18K rose gold"]], stock: [2, 6], tags: ["bracelet"] },
    { t: "Diamond Tennis Bracelet", price: 165000, img: ["diamondBracelet", "braceletWrist"], type: "Bracelet", col: ["bracelets-bangles"], feat: true, pop: 0.5, d: "A continuous line of round brilliants — the ultimate classic.", specs: [["Metal", "18K white gold"], ["Diamonds", "3.00 ct total"]], stock: [1, 2], tags: ["diamond"] },
    { t: "Gold Link Chain Bracelet", price: 29500, img: ["goldChainBracelet", "braceletWrist"], type: "Bracelet", col: ["bracelets-bangles"], pop: 1.3, d: "A bold paperclip-link bracelet in polished gold.", specs: [["Metal", "18K yellow gold"]], stock: [2, 6], tags: ["gold"] },
    { t: "22K Gold Bangles (Pair)", price: 145000, img: ["goldBangles"], type: "Bangles", col: ["bracelets-bangles", "bridal"], pop: 0.8, d: "Traditional hand-engraved bangles in hallmarked 22K gold.", specs: [["Metal", "22K hallmarked gold"], ["Weight", "approx. 16 g"]], opt: [{ name: "Size", values: ["2.4", "2.6", "2.8"] }], stock: [1, 3], tags: ["22k", "bangles"] },
    { t: "Automatic Steel Diver Watch", price: 48500, img: ["watchLuxury", "watchDark"], type: "Watch", col: ["watches"], feat: true, pop: 0.8, d: "A 200 m automatic diver with a sapphire crystal.", specs: [["Case", "41 mm stainless steel"], ["Movement", "Automatic, 42h reserve"]], stock: [1, 4], tags: ["watch", "men"] },
    { t: "Chronograph Leather Watch", price: 32500, img: ["chronograph", "watchDark"], type: "Watch", col: ["watches"], pop: 0.8, d: "Tri-compax chronograph on an Italian leather strap.", specs: [["Case", "42 mm"], ["Movement", "Quartz chronograph"]], stock: [1, 4], tags: ["watch"] },
  ],
  blog: [
    { title: "How to Choose an Engagement Ring", excerpt: "The 4Cs, metal choices and setting styles — explained simply.", cover: "diamondRing", tags: ["guide", "engagement"],
      points: [["Cut first", "Cut affects sparkle more than any other factor."], ["Choose the metal", "Yellow gold is classic; white gold makes diamonds look whiter."], ["Get it certified", "Always ask for an IGI or GIA certificate."]] },
    { title: "Caring for Your 22K Gold Jewellery", excerpt: "Simple habits that keep your heirlooms shining for generations.", cover: "templeNecklace", tags: ["care"],
      points: [["Store separately", "Keep each piece in a soft pouch to avoid scratches."], ["Avoid perfume", "Put jewellery on after perfume and makeup."], ["Clean gently", "Warm water, mild soap and a soft brush."]] },
    { title: "The Bridal Jewellery Edit", excerpt: "Pairing necklace sets, earrings and bangles with your wedding saree.", cover: "goldBangles", tags: ["bridal"],
      points: [["Balance", "A statement necklace pairs with smaller earrings."], ["Match the zari", "Gold zari sarees love 22K yellow gold."], ["Layer bangles", "Mix plain and engraved bangles for depth."]] },
  ],
  about: [
    "{store} has been crafting fine jewellery in Dhaka since 1998. Our master karigars combine traditional Bangladeshi techniques with contemporary design.",
    "Every piece is hallmarked, and every diamond above 0.30 ct comes with an international certificate.",
    "Book a private appointment at our Gulshan salon, or shop online with fully insured free delivery.",
  ],
  perks: ["Hallmarked & certified", "Free insured delivery", "Lifetime cleaning & polishing"],
  reviews: [
    "Absolutely stunning, even more beautiful in person.", "Beautiful packaging and certificate included.", "My wife loved it for our anniversary.",
    "Excellent craftsmanship.", "Delivery was secure and on time.", "The sparkle is incredible.", "Exactly what I wanted for my wedding.",
  ],
};

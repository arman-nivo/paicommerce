import type { Catalog } from "./types";

const BABY = { name: "Size", values: ["0–3M", "3–6M", "6–12M"] };
const KID = { name: "Age", values: ["2–3Y", "4–5Y", "6–7Y"] };

export const kids: Catalog = {
  key: "kids",
  vendor: "Playhouse",
  freeShippingOver: 2000,
  qty: [[1, 70], [2, 25], [3, 5]],
  collections: [
    { slug: "toys-games", title: "Toys & Games", description: "Fun that sparks imagination — from building bricks to die-cast cars.", img: "marioToys" },
    { slug: "learning", title: "Learning & Creativity", description: "Blocks, crayons and puzzles that make learning playful.", img: "crayons" },
    { slug: "baby", title: "Baby", description: "Soft, safe essentials for your little one's first year.", img: "babyBearSuit" },
    { slug: "kids-fashion", title: "Kids Fashion", description: "Comfy, colourful outfits for ages 2–7.", img: "boyRedTee" },
    { slug: "pet-supplies", title: "Pet Supplies", description: "Food, toys and cosy beds for your furry family members.", img: "corgi" },
  ],
  products: [
    { t: "Super Mario Figure Set (5 pcs)", price: 2450, img: ["marioToys", "toyStall"], type: "Figures", col: ["toys-games"], feat: true, pop: 2, d: "Mario, Luigi, Peach, Yoshi and Toad collectible figures.", h: ["Ages 3+", "Non-toxic PVC", "Gift boxed"], stock: [5, 20], tags: ["gift", "figures"] },
    { t: "Wooden Train Set (40 pcs)", price: 3450, img: ["woodenTrain", "trainSet"], type: "Train Set", col: ["toys-games", "learning"], feat: true, pop: 1.5, d: "Beechwood tracks, bridge, station and magnetic carriages.", h: ["Ages 3+", "Solid beechwood", "Compatible with major brands"], stock: [3, 12], tags: ["wooden", "montessori"] },
    { t: "Classic Building Bricks (1000 pcs)", price: 2950, img: ["lego", "legoFigs"], type: "Building Blocks", col: ["toys-games", "learning"], feat: true, pop: 2, d: "A huge tub of colourful bricks with idea booklet.", h: ["Ages 4+", "Compatible with leading brands", "Storage tub included"], stock: [5, 20], tags: ["blocks", "stem"] },
    { t: "Cuddly Teddy Bear (16 inch)", price: 1450, img: ["teddyClose", "teddyBasket"], type: "Plush", col: ["toys-games", "baby"], pop: 2, d: "Super-soft teddy with embroidered eyes — safe from birth.", h: ["Safe from 0+", "Machine washable", "Hypoallergenic filling"], stock: [8, 25], tags: ["plush", "gift"] },
    { t: "Die-Cast Vintage Convertible", price: 950, img: ["redToyCar", "whiteToyCar"], type: "Toy Car", col: ["toys-games"], pop: 1.5, d: "1:24 scale die-cast car with opening doors.", opt: [{ name: "Color", values: ["Red", "White"] }], stock: [5, 20], tags: ["cars"] },
    { t: "Rainbow Stacking Rings", price: 650, img: ["stackingRings", "colorBlocks"], type: "Baby Toy", col: ["baby", "learning"], pop: 2, d: "Classic stacker that teaches size and colour.", h: ["Ages 6M+", "BPA free"], stock: [8, 25], tags: ["baby", "montessori"] },
    { t: "Wooden ABC Blocks (26 pcs)", price: 1150, img: ["abcBlocks", "colorBlocks"], type: "Blocks", col: ["learning"], pop: 1.5, d: "Embossed alphabet blocks with numbers and animals.", stock: [8, 25], tags: ["learning", "wooden"] },
    { t: "Jumbo Crayons & Markers Art Kit", price: 850, img: ["crayons"], type: "Art Kit", col: ["learning"], pop: 1.8, d: "Washable crayons, markers and a sketch pad.", stock: [8, 25], tags: ["art"] },
    { t: "Wooden Sailboat Toy Set", price: 1250, img: ["woodenBoats"], type: "Wooden Toy", col: ["toys-games"], pop: 0.8, d: "Hand-painted boats that float in the bath.", stock: [5, 15], tags: ["wooden"] },
    { t: "Baby Bear Hooded Romper", price: 1350, img: ["babyBearSuit", "babyFeet"], type: "Romper", col: ["baby"], feat: true, pop: 2, d: "Snuggly fleece romper with bear ears.", opt: [BABY], tags: ["baby", "winter"] },
    { t: "Newborn Cotton Essentials Set", price: 1850, img: ["babyTeeSet", "babyFeet"], type: "Gift Set", col: ["baby"], pop: 1.5, d: "Organic cotton bodysuit, cap, mittens and booties.", opt: [BABY], tags: ["newborn", "gift"] },
    { t: "Inflatable Baby Swim Float", price: 750, img: ["babyFloat"], type: "Swim", col: ["baby"], pop: 0.8, d: "Seat float with a sun canopy for pool time.", stock: [5, 15], tags: ["summer"] },
    { t: "Boys Cardigan & Shorts Set", price: 1650, img: ["boyCardigan"], type: "Outfit", col: ["kids-fashion"], pop: 1.2, d: "Smart knit cardigan with bow tie and shorts.", opt: [KID], tags: ["party"] },
    { t: "Kids Cotton Tee — Red", price: 550, img: ["boyRedTee"], type: "T-Shirt", col: ["kids-fashion"], pop: 2, d: "Soft cotton crew-neck tee for everyday play.", opt: [KID], tags: ["basics"] },
    { t: "Kids Track Suit", price: 1950, img: ["kidTracksuit"], type: "Tracksuit", col: ["kids-fashion"], pop: 1, d: "Zip jacket and joggers in soft poly-cotton.", opt: [KID], tags: ["winter"] },
    { t: "Girls Denim Jacket", price: 1750, img: ["girlJacket"], type: "Jacket", col: ["kids-fashion"], pop: 1, d: "Classic light-wash denim jacket.", opt: [KID], tags: ["denim"] },
    { t: "Premium Adult Dog Food (3 kg)", price: 2850, img: ["kibble", "dogHappy"], type: "Dog Food", col: ["pet-supplies"], feat: true, pop: 2, d: "Chicken and rice recipe with omega-3 for shiny coats.", stock: [8, 25], tags: ["dog", "food"] },
    { t: "Squeaky Plush Dog Toy", price: 450, img: ["dogToy", "beagle"], type: "Pet Toy", col: ["pet-supplies"], pop: 2, d: "Tough plush toy with a squeaker inside.", stock: [10, 30], tags: ["dog"] },
    { t: "Cosy Dog Hoodie", price: 850, img: ["frenchieHoodie", "frenchie"], type: "Pet Apparel", col: ["pet-supplies"], pop: 1.2, d: "Warm fleece hoodie for small and medium dogs.", opt: [{ name: "Size", values: ["S", "M", "L"] }], tags: ["dog", "winter"] },
    { t: "Sisal Cat Scratching Post", price: 1650, img: ["catScratcher", "catTabby"], type: "Cat Furniture", col: ["pet-supplies"], pop: 1.2, d: "Sturdy sisal post with a dangling toy.", stock: [5, 15], tags: ["cat"] },
    { t: "Round Cat & Dog Bed", price: 2450, img: ["catDog", "gingerCat"], type: "Pet Bed", col: ["pet-supplies"], ext: true, pop: 1, d: "Plush donut bed that pets love to curl up in.", stock: [5, 15], tags: ["cat", "dog"] },
  ],
  blog: [
    { title: "Best Toys by Age: A Parent's Guide", excerpt: "What to buy at 6 months, 2 years and 5 years — and why it matters.", cover: "woodenTrain", tags: ["guide", "parenting"],
      points: [["0–12 months", "Stacking rings, soft toys and anything that crinkles."], ["2–3 years", "Blocks and simple trains build motor skills."], ["4+ years", "Building bricks and art kits spark creativity."]] },
    { title: "Screen-Free Weekend Activities for Kids", excerpt: "Eight easy ideas to keep little ones busy — no tablet required.", cover: "crayons", tags: ["activities"],
      points: [["Art corner", "Set up crayons, paper and stickers on the balcony."], ["Build-a-city", "Challenge them to build Dhaka with blocks."], ["Story time", "Let them narrate the story with their toys."]] },
    { title: "Keeping Your Pets Comfortable in Summer", excerpt: "Heat can be tough on cats and dogs. Here's how to help them stay cool.", cover: "corgi", tags: ["pets", "summer"],
      points: [["Fresh water", "Keep two water bowls in shaded places."], ["Walk early", "Avoid pavements between 11am and 4pm."], ["Brush often", "Removing loose fur helps them stay cool."]] },
  ],
  about: [
    "{store} is a family-run store for kids, babies and pets. As parents ourselves, we only sell products we'd happily give our own children.",
    "Every toy is checked for safety and age-appropriate design, and our baby clothes are made from soft, skin-friendly cotton.",
    "Fast delivery across Bangladesh with gift wrapping available on every order.",
  ],
  perks: ["Safety-checked products", "Free gift wrapping"],
  reviews: [
    "My son hasn't put it down since it arrived!", "Great quality and safe for my toddler.", "Perfect birthday gift.", "Soft fabric, fits well.",
    "My dog loves it.", "Arrived nicely gift-wrapped.", "Good value for money.",
  ],
};

import type { Catalog } from "./types";

const SHOE = { name: "Size", values: ["40", "41", "42", "43", "44"] };

export const sports: Catalog = {
  key: "sports",
  vendor: "Stride",
  freeShippingOver: 5000,
  qty: [[1, 80], [2, 17], [3, 3]],
  collections: [
    { slug: "running", title: "Running", description: "Shoes and gear engineered for every kilometre.", img: "runners" },
    { slug: "gym-training", title: "Gym & Training", description: "Dumbbells, kettlebells and home-gym essentials.", img: "dumbbellRack" },
    { slug: "football-cricket", title: "Football & Cricket", description: "Match-grade balls, bats and boots.", img: "footballGrass" },
    { slug: "yoga", title: "Yoga & Recovery", description: "Mats and accessories for mindful movement.", img: "yogaSunset" },
    { slug: "cycling", title: "Cycling", description: "Road and city bikes for Dhaka commutes and weekend rides.", img: "roadBike" },
    { slug: "activewear", title: "Activewear", description: "Breathable jerseys, joggers and training wear.", img: "jersey" },
  ],
  products: [
    { t: "Velocity Knit Running Shoe", price: 5450, cmp: 6450, img: ["meshShoes", "shoeFlying"], type: "Running Shoes", col: ["running"], feat: true, pop: 2.5, d: "Breathable knit upper and responsive foam for daily runs.", h: ["Engineered knit upper", "Responsive EVA foam", "8 mm drop"], opt: [SHOE], tags: ["running", "shoes"] },
    { t: "Cloud Trainer — White", price: 4950, img: ["runnerWhite", "runStairs"], type: "Running Shoes", col: ["running"], pop: 2, d: "Plush cushioning and a clean white look — gym to street.", h: ["Air-cushioned heel", "Rubber outsole"], opt: [SHOE], tags: ["shoes"] },
    { t: "Retro Runner — Olive", price: 5250, img: ["runnerOlive"], type: "Sneakers", col: ["running", "activewear"], pop: 1.5, d: "A heritage runner with suede overlays.", opt: [SHOE], tags: ["shoes", "lifestyle"] },
    { t: "Adjustable Dumbbell Pair", price: 6950, img: ["dumbbellHand", "dumbbellRack"], type: "Dumbbells", col: ["gym-training"], feat: true, pop: 2, d: "Chrome handles with cast-iron plates and spin-lock collars.", opt: [{ name: "Weight", values: ["2 × 5 kg", "2 × 10 kg", "2 × 15 kg"] }], abs: { "2 × 5 kg": 3950, "2 × 10 kg": 6950, "2 × 15 kg": 9950 }, stock: [3, 12], tags: ["home-gym"] },
    { t: "Olympic Barbell & Plate Set (60 kg)", price: 28500, img: ["barbellFloor", "plateRack", "deadlift"], type: "Barbell", col: ["gym-training"], pop: 0.5, d: "20 kg Olympic bar with rubber bumper plates.", stock: [1, 4], tags: ["strength"] },
    { t: "Resistance Band & Dumbbell Kit", price: 2450, img: ["dumbbellsBands"], type: "Training Kit", col: ["gym-training", "yoga"], pop: 1.8, d: "Two 3 kg dumbbells and a loop resistance band.", stock: [5, 20], tags: ["home-gym"] },
    { t: "Heavy Battle Rope (12 m)", price: 5950, img: ["battleRopes"], type: "Battle Rope", col: ["gym-training"], pop: 0.6, d: "38 mm poly-dacron rope with anchor strap.", stock: [2, 8], tags: ["conditioning"] },
    { t: "Cast Iron Kettlebell", price: 1850, img: ["kettlebellSwing", "gymBW"], type: "Kettlebell", col: ["gym-training"], pop: 1.5, d: "Single-cast iron with a powder-coated grip.", opt: [{ name: "Weight", values: ["8 kg", "12 kg", "16 kg"] }], abs: { "8 kg": 1850, "12 kg": 2650, "16 kg": 3450 }, stock: [3, 12], tags: ["strength"] },
    { t: "Non-Slip Yoga Mat (6 mm)", price: 1850, img: ["yogaMat", "yogaPose", "fitnessClass"], type: "Yoga Mat", col: ["yoga"], feat: true, pop: 2.5, d: "Cushioned TPE mat with alignment lines and carry strap.", opt: [{ name: "Color", values: ["Charcoal", "Lilac", "Teal"] }], tags: ["yoga"] },
    { t: "Pro Match Football (Size 5)", price: 2250, img: ["footballBlue", "footballGrass"], type: "Football", col: ["football-cricket"], feat: true, pop: 2, d: "Thermo-bonded match ball, FIFA-quality spec.", stock: [5, 20], tags: ["football"] },
    { t: "Firm Ground Football Boots", price: 5950, img: ["bootsBall", "footballKick"], type: "Football Boots", col: ["football-cricket"], pop: 1.2, d: "Lightweight boots with a grippy FG stud plate.", opt: [SHOE], tags: ["football"] },
    { t: "Tournament Leather Cricket Ball", price: 850, img: ["cricketBall", "stadium"], type: "Cricket Ball", col: ["football-cricket"], pop: 2, d: "Hand-stitched 4-piece leather ball, 156 g.", stock: [10, 40], tags: ["cricket"] },
    { t: "English Willow Cricket Bat", price: 9500, img: ["batsman", "stadium"], type: "Cricket Bat", col: ["football-cricket"], feat: true, pop: 1, d: "Grade 2 English willow with a thick edge and cane handle.", opt: [{ name: "Size", values: ["Short Handle", "Long Handle"] }], tags: ["cricket"] },
    { t: "Composite Badminton Racket", price: 2850, img: ["badminton", "tennis"], type: "Racket", col: ["football-cricket"], pop: 1.2, d: "Lightweight carbon racket, pre-strung.", stock: [5, 15], tags: ["badminton"] },
    { t: "Official Size Basketball", price: 2450, img: ["basketball", "basketballHoop"], type: "Basketball", col: ["football-cricket"], pop: 0.8, d: "Composite leather indoor/outdoor ball.", stock: [5, 15], tags: ["basketball"] },
    { t: "Club Football Jersey", price: 1450, img: ["jersey"], type: "Jersey", col: ["activewear", "football-cricket"], pop: 2, d: "Breathable replica jersey with dri-fit fabric.", opt: [{ name: "Size", values: ["S", "M", "L", "XL"] }], tags: ["jersey"] },
    { t: "Performance Jogger Pants", price: 1850, img: ["greyJoggers"], type: "Joggers", col: ["activewear"], pop: 1.5, d: "Four-way stretch joggers with zip pockets.", opt: [{ name: "Size", values: ["S", "M", "L", "XL"] }], tags: ["activewear"] },
    { t: "Aluminium Road Bike (700C)", price: 54500, img: ["roadBike", "roadBikeBlack"], type: "Bicycle", col: ["cycling"], feat: true, pop: 0.5, d: "Lightweight alloy frame with Shimano Claris 16-speed.", opt: [{ name: "Frame", values: ["M (54 cm)", "L (56 cm)"] }], tags: ["cycling"] },
    { t: "Single-Speed Fixie Bike", price: 32500, img: ["fixie"], type: "Bicycle", col: ["cycling"], pop: 0.6, d: "Minimal steel city bike with flip-flop hub.", stock: [1, 5], tags: ["cycling"] },
    { t: "Insulated Steel Water Bottle (1 L)", price: 1250, img: ["bottle"], type: "Bottle", col: ["gym-training", "cycling", "running"], pop: 2.5, d: "Keeps drinks cold for 24 hours.", stock: [15, 40], tags: ["accessory"] },
    { t: "Pastel Court Sneaker", price: 4650, img: ["pastelSneakers"], type: "Sneakers", col: ["activewear"], ext: true, pop: 1, d: "Retro court sneaker in pastel colour-block.", opt: [SHOE], tags: ["shoes"] },
  ],
  blog: [
    { title: "Couch to 5K: A Beginner's Plan for Dhaka Runners", excerpt: "Eight weeks, three runs a week — where and how to start running in the city.", cover: "runners", tags: ["running", "beginner"],
      points: [["Pick your route", "Hatirjheel and Dhanmondi Lake are great early-morning loops."], ["Walk-run intervals", "Start with 1 min run, 2 min walk and build up."], ["Invest in shoes", "Cushioned running shoes prevent shin splints."]] },
    { title: "Build a Home Gym Under ৳15,000", excerpt: "The only five pieces of equipment you really need.", cover: "dumbbellsBands", tags: ["home-gym"],
      points: [["Adjustable dumbbells", "The most versatile tool you can own."], ["Kettlebell", "Swings build power and cardio at once."], ["Mat & bands", "For mobility, core and warm-ups."]] },
    { title: "Choosing Your First Cricket Bat", excerpt: "English vs Kashmir willow, weight and handle length explained.", cover: "batsman", tags: ["cricket", "guide"],
      points: [["Willow", "English willow is lighter with better ping."], ["Weight", "Most adults play best with 1.1–1.2 kg."], ["Knock-in", "Always knock in a new bat before matches."]] },
  ],
  about: [
    "{store} gears up athletes across Bangladesh — from weekend cricketers to marathon runners.",
    "We stock authentic, performance-tested equipment and our team are athletes themselves, happy to help you pick the right gear.",
    "Free delivery on orders over ৳5,000 and easy size exchanges on all footwear.",
  ],
  perks: ["Authentic, performance-tested gear", "Free size exchange on footwear"],
  reviews: [
    "Very comfortable for my morning runs.", "Solid quality, feels premium.", "Perfect for my home workouts.", "Size was accurate.",
    "Great grip and build.", "Delivered quickly to Sylhet.", "Excellent value for the price.",
  ],
};

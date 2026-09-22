import type { Catalog } from "./types";

const PACK = (strip: number, box: number, per = 10) => ({ opt: [{ name: "Pack", values: [`Strip (${per})`, `Box (${per * 10})`] }], abs: { [`Strip (${per})`]: strip, [`Box (${per * 10})`]: box } });

export const health: Catalog = {
  key: "health",
  vendor: "Pulse Pharmacy",
  freeShippingOver: 1000,
  qty: [[1, 55], [2, 30], [3, 15]],
  collections: [
    { slug: "medicines", title: "Medicines", description: "Genuine OTC and prescription medicines from licensed distributors.", img: "blisterPacks" },
    { slug: "vitamins-supplements", title: "Vitamins & Supplements", description: "Daily vitamins, minerals and sports nutrition.", img: "pillsColor" },
    { slug: "personal-care", title: "Personal Care & Hygiene", description: "Sanitisers, masks and everyday care.", img: "sanitizers" },
    { slug: "medical-devices", title: "Medical Devices", description: "Home health devices and first-aid essentials.", img: "stethoscope" },
    { slug: "consultation", title: "Doctor Consultation", description: "Talk to a registered doctor from home.", img: "doctorPhone" },
  ],
  products: [
    { t: "Napa Extra (Paracetamol 500 mg + Caffeine 65 mg)", price: 25, img: ["blisterPacks", "pillsBlue"], vendor: "Beximco Pharma", type: "Tablet", col: ["medicines"], feat: true, pop: 4, d: "Fast relief from headache, fever and body pain.", h: ["OTC medicine", "Store below 30°C"], ...PACK(25, 250), tags: ["otc", "pain-relief"] },
    { t: "Seclo 20 (Omeprazole 20 mg)", price: 60, img: ["capsulesOrange", "blisterPacks2"], vendor: "Square Pharma", type: "Capsule", col: ["medicines"], pop: 3, d: "Relief from acidity, heartburn and gastric ulcers.", h: ["Take before meals", "Prescription recommended"], ...PACK(60, 600), tags: ["gastric"] },
    { t: "Fexo 120 (Fexofenadine 120 mg)", price: 90, img: ["blisterPacks2", "blisterSingle"], vendor: "Square Pharma", type: "Tablet", col: ["medicines"], pop: 2, d: "Non-drowsy antihistamine for allergy and hay fever.", ...PACK(90, 900), tags: ["allergy"] },
    { t: "Ace Plus (Paracetamol + Caffeine)", price: 25, img: ["blisterSingle", "pillsMask"], vendor: "Square Pharma", type: "Tablet", col: ["medicines"], pop: 2.5, d: "Fast-acting pain and fever relief.", ...PACK(25, 250), tags: ["otc"] },
    { t: "Low-Dose Aspirin 75 mg (30 tabs)", price: 45, img: ["aspirinBottle"], type: "Tablet", col: ["medicines"], pop: 1, d: "Doctor-recommended for heart health. Use only as prescribed.", stock: [30, 100], tags: ["cardiac"] },
    { t: "Oral Rehydration Salts (ORS, 20 sachets)", price: 120, img: ["pillsOrangeBg", "pillsPile"], vendor: "SMC", type: "Sachet", col: ["medicines"], pop: 2, d: "Restores fluids and electrolytes lost to heat and diarrhoea.", stock: [30, 100], tags: ["otc", "summer"] },
    { t: "Vitamin D3 2000 IU (60 softgels)", price: 650, img: ["capsulesOrange", "pillsOrangeBg"], type: "Supplement", col: ["vitamins-supplements"], feat: true, pop: 2, d: "Supports bones, teeth and immunity.", stock: [20, 60], tags: ["vitamin-d"] },
    { t: "Daily Multivitamin (90 tablets)", price: 1250, img: ["pillsColor", "pillsPile"], type: "Supplement", col: ["vitamins-supplements"], pop: 1.8, d: "23 essential vitamins and minerals in one tablet a day.", stock: [15, 50], tags: ["multivitamin"] },
    { t: "Omega-3 Fish Oil 1000 mg (100 softgels)", price: 1150, img: ["pillsPile", "vials"], type: "Supplement", col: ["vitamins-supplements"], pop: 1.2, d: "EPA and DHA for heart and brain health.", stock: [15, 50], tags: ["omega-3"] },
    { t: "Calcium + Vitamin D (60 tablets)", price: 450, img: ["pillsColor", "blisterSingle"], type: "Supplement", col: ["vitamins-supplements"], pop: 1.2, d: "Calcium carbonate 500 mg with vitamin D3.", stock: [15, 50], tags: ["calcium"] },
    { t: "Whey Protein Isolate (2 lb)", price: 6950, img: ["proteinPowder", "proteinShake"], type: "Protein", col: ["vitamins-supplements"], feat: true, pop: 1, d: "25 g protein per scoop, low sugar, lab-tested.", opt: [{ name: "Flavour", values: ["Chocolate", "Vanilla"] }], stock: [3, 12], tags: ["protein", "fitness"] },
    { t: "Hand Sanitizer (500 ml)", price: 350, img: ["sanitizers"], type: "Sanitizer", col: ["personal-care"], pop: 2, d: "70% alcohol gel with aloe vera.", stock: [20, 80], tags: ["hygiene"] },
    { t: "3-Ply Surgical Face Masks (Box of 50)", price: 250, img: ["faceMasks"], type: "Mask", col: ["personal-care"], feat: true, pop: 2, d: "BFE ≥ 95% disposable masks with nose clip.", stock: [20, 80], tags: ["hygiene"] },
    { t: "Nitrile Examination Gloves (100)", price: 950, img: ["gloves"], type: "Gloves", col: ["personal-care", "medical-devices"], pop: 1, d: "Powder-free, latex-free nitrile gloves.", opt: [{ name: "Size", values: ["S", "M", "L"] }], tags: ["hygiene"] },
    { t: "Gentle Moisturising Cream (100 g)", price: 450, img: ["creamTube", "creamJar"], type: "Skin Care", col: ["personal-care"], pop: 1.2, d: "Fragrance-free cream for dry and sensitive skin.", stock: [15, 50], tags: ["skin"] },
    { t: "Dual-Head Stethoscope", price: 2850, img: ["stethoscope", "doctorCoat"], type: "Device", col: ["medical-devices"], pop: 0.6, d: "Stainless steel chest piece for clear acoustics.", stock: [3, 10], tags: ["device"] },
    { t: "Weekly Pill Organiser", price: 350, img: ["pillOrganizer", "pillOrganizerKit"], type: "Accessory", col: ["medical-devices"], pop: 1.5, d: "Seven-day AM/PM organiser with easy-open lids.", stock: [10, 40], tags: ["accessory"] },
    { t: "Online Doctor Consultation (15 min)", price: 500, img: ["doctorPhone", "doctor"], type: "Service", col: ["consultation"], feat: true, digital: true, pop: 1.2, d: "Video consultation with a BMDC-registered GP, prescription included.", h: ["Available 9am–11pm", "Prescription by email"], tags: ["telemedicine"] },
  ],
  blog: [
    { title: "Monsoon Health Tips: Staying Well in the Rainy Season", excerpt: "Dengue, typhoid and stomach bugs peak in monsoon. Simple steps to protect your family.", cover: "pillsMask", tags: ["seasonal", "prevention"],
      points: [["Beat the mosquitoes", "Empty standing water weekly and use nets at night."], ["Drink safe water", "Boil or filter all drinking water."], ["Know the signs", "High fever with body ache? Test for dengue early."]] },
    { title: "Do You Need a Vitamin D Supplement?", excerpt: "Despite the sunshine, most Bangladeshis are low in vitamin D. Here's why.", cover: "capsulesOrange", tags: ["vitamins"],
      points: [["Why it's common", "Indoor lifestyles and covered clothing limit sun exposure."], ["Symptoms", "Fatigue, bone pain and frequent illness."], ["Get tested", "A simple blood test tells you where you stand."]] },
    { title: "Building a Home First-Aid Kit", excerpt: "The ten items every Bangladeshi household should keep ready.", cover: "pillOrganizerKit", tags: ["first-aid"],
      points: [["Basics", "Bandages, antiseptic, gauze and tape."], ["Medicines", "Paracetamol, ORS and antihistamines."], ["Tools", "Thermometer, gloves and scissors."]] },
  ],
  about: [
    "{store} is a licensed online pharmacy (DGDA-registered) delivering genuine medicines across Dhaka and beyond.",
    "Every medicine is sourced directly from manufacturers or authorised distributors and stored at controlled temperatures.",
    "Upload your prescription and our pharmacists will verify and prepare your order within an hour.",
  ],
  perks: ["100% genuine medicines", "Pharmacist-verified orders"],
  reviews: [
    "Genuine medicine, checked the batch and expiry.", "Very fast delivery, within 2 hours.", "Pharmacist called to confirm my prescription. Very professional.",
    "Good discount compared to local pharmacy.", "Reliable service.", "Packaging was sealed and neat.", "Doctor was very helpful.",
  ],
};

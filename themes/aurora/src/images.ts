/**
 * Aurora's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/aurora`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Fashion
  heroFashion: `https://images.unsplash.com/photo-1469334031218-e382a71b716b${q}&w=2000`,
  heroFashionAlt: `https://images.unsplash.com/photo-1483985988355-763728e1935b${q}&w=2000`,
  editorialWoman: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f${q}&w=1400`,
  editorialMan: `https://images.unsplash.com/photo-1490114538077-0a7f8cb49891${q}&w=1400`,
  lookbook: `https://images.unsplash.com/photo-1529139574466-a303027c1d8b${q}&w=1800`,
  lifestyle: `https://images.unsplash.com/photo-1487222477894-8943e31ef7b2${q}&w=1400`,
  detail: `https://images.unsplash.com/photo-1496747611176-843222e1e57c${q}&w=900`,
  rack: `https://images.unsplash.com/photo-1490481651871-ab68de25d43d${q}&w=1600`,
  gallery: [
    `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446${q}&w=900`,
    `https://images.unsplash.com/photo-1496747611176-843222e1e57c${q}&w=900`,
    `https://images.unsplash.com/photo-1509631179647-0177331693ae${q}&w=900`,
    `https://images.unsplash.com/photo-1539109136881-3be0616acf4b${q}&w=900`,
    `https://images.unsplash.com/photo-1503342217505-b0a15ec3261c${q}&w=900`,
    `https://images.unsplash.com/photo-1581044777550-4cfa60707c03${q}&w=900`,
  ],
  // Jewelry
  heroJewelry: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338${q}&w=2000`,
  jewelryEarrings: `https://images.unsplash.com/photo-1535632066927-ab7c9ab60908${q}&w=1400`,
  jewelryDetail: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f${q}&w=1400`,
  jewelryAccessories: `https://images.unsplash.com/photo-1611591437281-460bfbe1220a${q}&w=1400`,
  // General
  heroGeneral: `https://images.unsplash.com/photo-1472851294608-062f824d29cc${q}&w=2000`,
  store: `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04${q}&w=1400`,
  tote: `https://images.unsplash.com/photo-1548036328-c9fa89d128fa${q}&w=1400`,
  sneaker: `https://images.unsplash.com/photo-1491553895911-0055eca6402d${q}&w=1400`,
  // People (testimonials)
  avatar1: `https://images.unsplash.com/photo-1494790108377-be9c29b29330${q}&w=200`,
  avatar2: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d${q}&w=200`,
  avatar3: `https://images.unsplash.com/photo-1544005313-94ddf0286df2${q}&w=200`,
};

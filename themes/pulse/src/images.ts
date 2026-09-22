/**
 * Pulse's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/pulse`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Pharmacy
  pharmacyStore: `https://images.unsplash.com/photo-1576602976047-174e57a47881${q}&w=1800`,
  pharmacist: `https://images.unsplash.com/photo-1612776572997-76cc42e058c3${q}&w=1400`,
  doctor: `https://images.unsplash.com/photo-1612531386530-97286d97c2d2${q}&w=1400`,
  doctorPhone: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${q}&w=1200`,
  doctorCoat: `https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7${q}&w=1200`,
  stethoscope: `https://images.unsplash.com/photo-1505751172876-fa1923c5c528${q}&w=1200`,
  capsulesOrange: `https://images.unsplash.com/photo-1587854692152-cbe660dbde88${q}&w=1400`,
  blisterPacks: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae${q}&w=1200`,
  blisterMix: `https://images.unsplash.com/photo-1631549916768-4119b2e5f926${q}&w=1200`,
  pillsColor: `https://images.unsplash.com/photo-1471864190281-a93a3070b6de${q}&w=1200`,
  pillsBlue: `https://images.unsplash.com/photo-1628771065518-0d82f1938462${q}&w=1200`,
  pillOrganizer: `https://images.unsplash.com/photo-1563213126-a4273aed2016${q}&w=1200`,
  kitFlatlay: `https://images.unsplash.com/photo-1603398938378-e54eab446dde${q}&w=1200`,
  faceMasks: `https://images.unsplash.com/photo-1584634731339-252c581abfc5${q}&w=1200`,
  sanitizers: `https://images.unsplash.com/photo-1583947215259-38e31be8751f${q}&w=1200`,
  proteinShake: `https://images.unsplash.com/photo-1579722821273-0f6c7d44362f${q}&w=1200`,
  lab: `https://images.unsplash.com/photo-1583912086096-8c60d75a53f9${q}&w=1400`,
  // Beauty & personal care preset
  skincareSet: `https://images.unsplash.com/photo-1598440947619-2c35fc9aa908${q}&w=1400`,
  serumDropper: `https://images.unsplash.com/photo-1617897903246-719242758050${q}&w=1200`,
  creamJar: `https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19${q}&w=1200`,
  productsLineup: `https://images.unsplash.com/photo-1629198688000-71f23e745b6e${q}&w=1800`,
  facial: `https://images.unsplash.com/photo-1570172619644-dfd03ed5d881${q}&w=1200`,
  // Organic & wellness grocery preset
  produceAisle: `https://images.unsplash.com/photo-1542838132-92c53300491e${q}&w=1800`,
  fruitsMix: `https://images.unsplash.com/photo-1610832958506-aa56368176cf${q}&w=1400`,
  saladBowl: `https://images.unsplash.com/photo-1540420773420-3366772f4999${q}&w=1200`,
  honey: `https://images.unsplash.com/photo-1558642452-9d2a7deb7f62${q}&w=1200`,
  almonds: `https://images.unsplash.com/photo-1508061253366-f7da158b6d46${q}&w=1200`,
  // People (testimonials)
  avatar1: `https://images.unsplash.com/photo-1494790108377-be9c29b29330${q}&w=200`,
  avatar2: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d${q}&w=200`,
  avatar3: `https://images.unsplash.com/photo-1544005313-94ddf0286df2${q}&w=200`,
};

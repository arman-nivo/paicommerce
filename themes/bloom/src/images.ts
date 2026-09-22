/**
 * Bloom's default imagery — every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/bloom`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Heroes & editorial
  heroPortrait: `https://images.unsplash.com/photo-1531746020798-e6953c6e8e04${q}&w=1800`, // soft portrait on blush
  heroHair: `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e${q}&w=1800`, // hair on pink backdrop
  heroFlatlay: `https://images.unsplash.com/photo-1571875257727-256c39da42af${q}&w=1800`, // makeup + flowers flatlay
  creamHand: `https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19${q}&w=1400`, // cream jar in hand, blush backdrop
  serumDropper: `https://images.unsplash.com/photo-1617897903246-719242758050${q}&w=1400`,
  serumBottle: `https://images.unsplash.com/photo-1576426863848-c21f53c60b19${q}&w=1400`,
  lineup: `https://images.unsplash.com/photo-1629198688000-71f23e745b6e${q}&w=1400`,
  whiteBottles: `https://images.unsplash.com/photo-1631729371254-42c2892f0e6e${q}&w=1400`,
  amberDropper: `https://images.unsplash.com/photo-1608571423902-eed4a5ad8108${q}&w=1400`,
  amberBottles: `https://images.unsplash.com/photo-1631730359585-38a4935cbec4${q}&w=1400`,
  gouache: `https://images.unsplash.com/photo-1600428877878-1a0fd85beda8${q}&w=1400`, // serum + roller
  oilSkin: `https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f${q}&w=1400`,
  oilHands: `https://images.unsplash.com/photo-1515377905703-c4788e51af15${q}&w=1400`,
  flowerBath: `https://images.unsplash.com/photo-1526758097130-bab247274f58${q}&w=1400`,
  spaTowels: `https://images.unsplash.com/photo-1590439471364-192aa70c0b53${q}&w=1400`,
  makeupPortrait: `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2${q}&w=1400`,
  redLip: `https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec${q}&w=1400`,
  palette: `https://images.unsplash.com/photo-1596704017254-9b121068fb31${q}&w=1400`,
  makeupFlatlay: `https://images.unsplash.com/photo-1596462502278-27bfdc403348${q}&w=1400`,
  avocadoMask: `https://images.unsplash.com/photo-1596755389378-c31d21fd1273${q}&w=1400`,
  facial: `https://images.unsplash.com/photo-1616394584738-fc6e612e71b9${q}&w=1400`,
  skinPortrait: `https://images.unsplash.com/photo-1519699047748-de8e457a634e${q}&w=1400`,
  lotionTube: `https://images.unsplash.com/photo-1620916566398-39f1143ab7be${q}&w=1400`,
  lipBalm: `https://images.unsplash.com/photo-1599305090598-fe179d501227${q}&w=1400`,
  perfumeRose: `https://images.unsplash.com/photo-1592945403244-b3fbafd7f539${q}&w=1400`,
  dropperHand: `https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c${q}&w=1400`,
  // Ingredients
  orange: `https://images.unsplash.com/photo-1582979512210-99b6a53386f9${q}&w=600`,
  aloe: `https://images.unsplash.com/photo-1596547609652-9cf5d8d76921${q}&w=600`,
  honey: `https://images.unsplash.com/photo-1558642452-9d2a7deb7f62${q}&w=600`,
  coconut: `https://images.unsplash.com/photo-1526947425960-945c6e72858f${q}&w=600`,
  lemons: `https://images.unsplash.com/photo-1590502593747-42a996133562${q}&w=600`,
  // Wellness / gifts
  capsules: `https://images.unsplash.com/photo-1587854692152-cbe660dbde88${q}&w=1400`,
  giftFlatlay: `https://images.unsplash.com/photo-1571875257727-256c39da42af${q}&w=1400`,
  // People (reviews)
  avatar1: `https://images.unsplash.com/photo-1580489944761-15a19d654956${q}&w=240`,
  avatar2: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80${q}&w=240`,
  avatar3: `https://images.unsplash.com/photo-1567532939604-b6b5b0db2604${q}&w=240`,
  avatar4: `https://images.unsplash.com/photo-1506956191951-7a88da4435e5${q}&w=240`,
  avatar5: `https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91${q}&w=240`,
};

/** Square-ish social gallery. */
export const GALLERY = [
  IMG.creamHand,
  IMG.serumDropper,
  IMG.flowerBath,
  IMG.redLip,
  IMG.lineup,
  IMG.oilSkin,
  IMG.palette,
  IMG.spaTowels,
  IMG.avocadoMask,
].map((x) => x.replace(/w=\d+/, "w=700"));

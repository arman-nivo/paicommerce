/**
 * Bloom's default imagery — every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/bloom`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";
const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}${q}&w=${w}`;

export const IMG = {
  // Heroes & editorial
  heroPortrait: u("photo-1531746020798-e6953c6e8e04", 1800), // soft portrait on blush
  heroHair: u("photo-1522337360788-8b13dee7a37e", 1800), // hair on pink backdrop
  heroFlatlay: u("photo-1571875257727-256c39da42af", 1800), // makeup + flowers flatlay
  creamHand: u("photo-1601049541289-9b1b7bbbfe19"), // cream jar in hand, blush backdrop
  serumDropper: u("photo-1617897903246-719242758050"),
  serumBottle: u("photo-1576426863848-c21f53c60b19"),
  lineup: u("photo-1629198688000-71f23e745b6e"),
  whiteBottles: u("photo-1631729371254-42c2892f0e6e"),
  amberDropper: u("photo-1608571423902-eed4a5ad8108"),
  amberBottles: u("photo-1631730359585-38a4935cbec4"),
  gouache: u("photo-1600428877878-1a0fd85beda8"), // serum + roller
  oilSkin: u("photo-1573461160327-b450ce3d8e7f"),
  oilHands: u("photo-1515377905703-c4788e51af15"),
  flowerBath: u("photo-1526758097130-bab247274f58"),
  spaTowels: u("photo-1590439471364-192aa70c0b53"),
  makeupPortrait: u("photo-1487412947147-5cebf100ffc2"),
  redLip: u("photo-1616683693504-3ea7e9ad6fec"),
  palette: u("photo-1596704017254-9b121068fb31"),
  makeupFlatlay: u("photo-1596462502278-27bfdc403348"),
  avocadoMask: u("photo-1596755389378-c31d21fd1273"),
  facial: u("photo-1616394584738-fc6e612e71b9"),
  skinPortrait: u("photo-1519699047748-de8e457a634e"),
  lotionTube: u("photo-1620916566398-39f1143ab7be"),
  lipBalm: u("photo-1599305090598-fe179d501227"),
  perfumeRose: u("photo-1592945403244-b3fbafd7f539"),
  dropperHand: u("photo-1620916297397-a4a5402a3c6c"),
  // Ingredients
  orange: u("photo-1582979512210-99b6a53386f9", 600),
  aloe: u("photo-1596547609652-9cf5d8d76921", 600),
  honey: u("photo-1558642452-9d2a7deb7f62", 600),
  coconut: u("photo-1526947425960-945c6e72858f", 600),
  lemons: u("photo-1590502593747-42a996133562", 600),
  // Wellness / gifts
  capsules: u("photo-1587854692152-cbe660dbde88"),
  giftFlatlay: u("photo-1571875257727-256c39da42af"),
  // People (reviews)
  avatar1: u("photo-1580489944761-15a19d654956", 240),
  avatar2: u("photo-1438761681033-6461ffad8d80", 240),
  avatar3: u("photo-1567532939604-b6b5b0db2604", 240),
  avatar4: u("photo-1506956191951-7a88da4435e5", 240),
  avatar5: u("photo-1508214751196-bcfd4ca60f91", 240),
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
].map((x) => x.replace(/w=\d+/, "w=700"));

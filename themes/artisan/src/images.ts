/**
 * Artisan's default imagery — every URL is a verified Unsplash photo, checked by eye on a contact
 * sheet (run `node tools/verify-images.mjs themes/artisan`). Merchants replace them in the customizer.
 *
 * Maker portraits are deliberately "hands at work" shots rather than identifiable faces; the copy
 * that uses them describes illustrative makers.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Hands at work (used for maker stories & artisan profiles)
  potteryWheel: `https://images.unsplash.com/photo-1493106641515-6b5631de4bb9${q}&w=1600`, // clay-covered hands throwing a pot
  metalsmith: `https://images.unsplash.com/photo-1606722590583-6951b5ea92ad${q}&w=1400`, // smith hammering copper in a workshop
  leatherCraft: `https://images.unsplash.com/photo-1506806732259-39c2d0268443${q}&w=1400`, // hands tooling leather on a bench
  needleHands: `https://images.unsplash.com/photo-1541944743827-e04aa6427c33${q}&w=1400`, // hands with needles and yarn
  paintPalette: `https://images.unsplash.com/photo-1452802447250-470a88ac82bc${q}&w=1400`, // painter's palette & brush
  tinyPot: `https://images.unsplash.com/photo-1614350292382-c448d0110dfa${q}&w=1200`, // hand holding a tray of tiny glazed pots
  // Workshop & studio
  potteryStudio: `https://images.unsplash.com/photo-1595351298020-038700609878${q}&w=1400`, // clay tools beside a spinning wheel
  artistStudio: `https://images.unsplash.com/photo-1459908676235-d5f02a50184b${q}&w=1400`, // painter's bench full of brushes
  brushes: `https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b${q}&w=1200`, // worn paint brushes
  paintTubes: `https://images.unsplash.com/photo-1513364776144-60967b0f800f${q}&w=1200`,
  yarn: `https://images.unsplash.com/photo-1584992236310-6edddc08acff${q}&w=1200`, // hand-dyed wool
  // Pieces
  greyVases: `https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261${q}&w=1400`,
  handmadeCups: `https://images.unsplash.com/photo-1590422749897-47036da0b0ff${q}&w=1200`, // stacked hand-pinched cups
  speckledCups: `https://images.unsplash.com/photo-1610701596007-11502861dcfa${q}&w=1200`,
  ceramicsTable: `https://images.unsplash.com/photo-1610701596061-2ecf227e85b2${q}&w=1400`, // plates & bowls on a wooden table
  stonewareDark: `https://images.unsplash.com/photo-1525974160448-038dacadcc71${q}&w=1200`, // speckled bottle & cups, dark wall
  plates: `https://images.unsplash.com/photo-1578749556568-bc2c40e68b61${q}&w=1200`,
  terracotta: `https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d${q}&w=1200`, // small terracotta vessels
  whiteVase: `https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c${q}&w=1200`,
  kilim: `https://images.unsplash.com/photo-1594040226829-7f251ab46d80${q}&w=1200`, // hand-woven striped rug
  rugRoll: `https://images.unsplash.com/photo-1600166898405-da9535204843${q}&w=1200`,
  rustBedspread: `https://images.unsplash.com/photo-1616627561839-074385245ff6${q}&w=1400`, // rust quilt on a low bed
  kraftTote: `https://images.unsplash.com/photo-1544816155-12df9643f363${q}&w=1200`,
  leatherBag: `https://images.unsplash.com/photo-1622560480605-d83c853bc5c3${q}&w=1200`,
  floralPainting: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5${q}&w=1200`,
  landscapePainting: `https://images.unsplash.com/photo-1578301978693-85fa9c0320b9${q}&w=1200`,
  birdPrint: `https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1${q}&w=1200`,
  watercolor: `https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17${q}&w=1200`,
  candles: `https://images.unsplash.com/photo-1572726729207-a78d6feb18d7${q}&w=1200`,
  soaps: `https://images.unsplash.com/photo-1607006344380-b6775a0824a7${q}&w=1200`,
  // Rooms & gifting
  macrameRoom: `https://images.unsplash.com/photo-1556228453-efd6c1ff04f6${q}&w=1800`, // living room with macramé hanging
  bohoRoom: `https://images.unsplash.com/photo-1618220179428-22790b461013${q}&w=1600`,
  bedroomBoho: `https://images.unsplash.com/photo-1615874959474-d609969a20ed${q}&w=1600`,
  galleryWall: `https://images.unsplash.com/photo-1513519245088-0e12902e5a38${q}&w=1600`, // framed prints on shelves
  giftHands: `https://images.unsplash.com/photo-1512909006721-3d6018887383${q}&w=1400`, // gift in kraft paper held out
};

/** Workshop-floor gallery (masonry). */
export const WORKSHOP_GALLERY: { image: string; caption: string; alt: string }[] = [
  { image: IMG.stonewareDark, caption: "Fresh from the kiln", alt: "Speckled stoneware bottle and cups against a dark wall" },
  { image: IMG.handmadeCups, caption: "Pinched cups, drying", alt: "Stack of hand-pinched white cups" },
  { image: IMG.metalsmith, caption: "Copper, hammered cold", alt: "A smith hammering a copper vessel" },
  { image: IMG.kilim, caption: "Shataranji on the loom floor", alt: "Hand-woven striped rug on a concrete floor" },
  { image: IMG.terracotta, caption: "Terracotta, before the kiln", alt: "Small terracotta vessels on a table" },
  { image: IMG.artistStudio, caption: "The painting room", alt: "Painter's bench with brushes and jars" },
  { image: IMG.needleHands, caption: "Needlework, after lunch", alt: "Hands working a needle through wool" },
  { image: IMG.ceramicsTable, caption: "Glaze test day", alt: "Handmade plates and bowls on a wooden table" },
];

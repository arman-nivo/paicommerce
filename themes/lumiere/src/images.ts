/**
 * Lumière's default imagery — every URL is a verified Unsplash photo, checked by eye
 * (run `node tools/verify-images.mjs themes/lumiere`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Cinematic / dark
  templeNecklace: `https://images.unsplash.com/photo-1601121141461-9d6647bca1ed${q}&w=2000`, // 22K temple necklace on black
  diamondBust: `https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1${q}&w=1600`, // diamond necklace on a black bust
  emeraldPendant: `https://images.unsplash.com/photo-1599643477877-530eb83abc8e${q}&w=1600`, // emerald pendant, warm bokeh
  diamondBracelet: `https://images.unsplash.com/photo-1573408301185-9146fe634ad0${q}&w=1400`, // diamond bracelet on black
  goldBows: `https://images.unsplash.com/photo-1607344645866-009c320b63e0${q}&w=2000`, // gold ribbons on black
  hoopsShadow: `https://images.unsplash.com/photo-1617038220319-276d3cfab638${q}&w=1400`, // hoops on a stone, soft shadows
  // Editorial — worn
  pearlEarring: `https://images.unsplash.com/photo-1590166223826-12dee1677420${q}&w=1600`, // pearl drop earring, close portrait
  necklaceNeck: `https://images.unsplash.com/photo-1611652022419-a9419f74343d${q}&w=1400`, // fine necklace, white shirt
  dropNecklace: `https://images.unsplash.com/photo-1611085583191-a3b181a88401${q}&w=1400`, // pearl drop pendant worn
  layered: `https://images.unsplash.com/photo-1601821765780-754fa98637c1${q}&w=1400`, // layered gold chains worn
  ringsHands: `https://images.unsplash.com/photo-1633934542430-0905ccb5f050${q}&w=1400`, // rings & bracelet on hands
  ringNecklace: `https://images.unsplash.com/photo-1620656798579-1984d9e87df7${q}&w=1400`, // ring + pendant, black top
  handsGold: `https://images.unsplash.com/photo-1596944924616-7b38e7cfac36${q}&w=1400`, // hands with fine gold
  hoopEar: `https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9${q}&w=1400`,
  bride: `https://images.unsplash.com/photo-1617627143750-d86bc21e42bb${q}&w=1600`, // South Asian bride in red, gold jewellery
  saree: `https://images.unsplash.com/photo-1610030469983-98e550d6193c${q}&w=1600`, // saree portrait on red
  earringsHeels: `https://images.unsplash.com/photo-1549439602-43ebca2327af${q}&w=1400`, // earrings & heels, black and white
  // Product-like stills
  pearls: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338${q}&w=1400`, // pearls in a jewellery box
  diamondRing: `https://images.unsplash.com/photo-1605100804763-247f67b3557e${q}&w=1400`,
  solitaire: `https://images.unsplash.com/photo-1598560917807-1bae44bd2be8${q}&w=1400`,
  stackRings: `https://images.unsplash.com/photo-1543294001-f7cd5d7fb516${q}&w=1400`,
  goldBangles: `https://images.unsplash.com/photo-1611107683227-e9060eccd846${q}&w=1400`,
  pendantGold: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f${q}&w=1400`,
  sapphireEarrings: `https://images.unsplash.com/photo-1535632066927-ab7c9ab60908${q}&w=1400`,
  weddingBands: `https://images.unsplash.com/photo-1622398925373-3f91b1e275f5${q}&w=1400`, // two gold bands on blush
  ringsFlowers: `https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8${q}&w=1400`, // wedding rings on peonies
  ringBox: `https://images.unsplash.com/photo-1512163143273-bde0e3cc7407${q}&w=1400`, // ring in an open box
  ringTray: `https://images.unsplash.com/photo-1631982690223-8aa4be0a2497${q}&w=1400`, // rings in a velvet tray
  tennisBracelet: `https://images.unsplash.com/photo-1619119069152-a2b331eb392a${q}&w=1400`,
  watchHand: `https://images.unsplash.com/photo-1524592094714-0f0654e20314${q}&w=1400`, // watch held in hand
  watchDark: `https://images.unsplash.com/photo-1612817159949-195b6eb9e31a${q}&w=1400`,
  // Atelier / craft
  metalsmith: `https://images.unsplash.com/photo-1606722590583-6951b5ea92ad${q}&w=1400`, // craftsman at a metal bench
  workbench: `https://images.unsplash.com/photo-1506806732259-39c2d0268443${q}&w=1400`, // hands sketching at a workbench
};

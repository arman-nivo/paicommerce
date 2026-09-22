/**
 * Bazaar's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/bazaar`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  /* ── hero slides & banners ── */
  shoppingBags: `https://images.unsplash.com/photo-1483985988355-763728e1935b${q}&w=1600`,
  laptopRainbow: `https://images.unsplash.com/photo-1603302576837-37561b2e2302${q}&w=1600`,
  fruitsMix: `https://images.unsplash.com/photo-1610832958506-aa56368176cf${q}&w=1600`,
  sneakerRed: `https://images.unsplash.com/photo-1542291026-7eec264c27ff${q}&w=1600`,
  headphonesYellow: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e${q}&w=900`,
  makeupFlatlay: `https://images.unsplash.com/photo-1596462502278-27bfdc403348${q}&w=900`,
  livingBright: `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0${q}&w=1200`,
  produceAisle: `https://images.unsplash.com/photo-1542838132-92c53300491e${q}&w=1200`,
  colorRack: `https://images.unsplash.com/photo-1601924994987-69e26d50dc26${q}&w=1200`,
  supermarket: `https://images.unsplash.com/photo-1604719312566-8912e9227c6a${q}&w=1600`,
  techFlatlay: `https://images.unsplash.com/photo-1468495244123-6c6c332eeece${q}&w=1600`,

  /* ── category icons ── */
  iphoneX: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9${q}&w=400`,
  laptopDesk: `https://images.unsplash.com/photo-1496181133206-80ce9b88a853${q}&w=400`,
  headphonesGrey: `https://images.unsplash.com/photo-1546435770-a3e426bf472b${q}&w=400`,
  smartwatchBlack: `https://images.unsplash.com/photo-1546868871-7041f2a55e12${q}&w=400`,
  blueShirtMan: `https://images.unsplash.com/photo-1620012253295-c15cc3e65df4${q}&w=400`,
  floralWrapDress: `https://images.unsplash.com/photo-1496747611176-843222e1e57c${q}&w=400`,
  sneakerWhite: `https://images.unsplash.com/photo-1608231387042-66d1773070a5${q}&w=400`,
  redHandbag: `https://images.unsplash.com/photo-1584917865442-de89df76afd3${q}&w=400`,
  lipstick: `https://images.unsplash.com/photo-1586495777744-4413f21062fa${q}&w=400`,
  serumDropper: `https://images.unsplash.com/photo-1617897903246-719242758050${q}&w=400`,
  candleGlow: `https://images.unsplash.com/photo-1603006905003-be475563bc59${q}&w=400`,
  whiteArmchair: `https://images.unsplash.com/photo-1567538096630-e0c55bd6374c${q}&w=400`,
  vegMarket: `https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c${q}&w=600`,
  apples: `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6${q}&w=400`,
  rice: `https://images.unsplash.com/photo-1586201375761-83865001e31c${q}&w=400`,
  capsules: `https://images.unsplash.com/photo-1587854692152-cbe660dbde88${q}&w=400`,

  /* ── brand tiles ── */
  phoneFloat: `https://images.unsplash.com/photo-1605236453806-6ff36851218e${q}&w=600`,
  speakerFlip: `https://images.unsplash.com/photo-1608043152269-423dbba4e7e1${q}&w=600`,
  skincareSet: `https://images.unsplash.com/photo-1598440947619-2c35fc9aa908${q}&w=600`,
  yellowArmchair: `https://images.unsplash.com/photo-1586023492125-27b2c045efd7${q}&w=600`,
  rack: `https://images.unsplash.com/photo-1490481651871-ab68de25d43d${q}&w=600`,
  earbudsWhite: `https://images.unsplash.com/photo-1600294037681-c80b4cb5b434${q}&w=600`,
  proteinPowder: `https://images.unsplash.com/photo-1593095948071-474c5cc2989d${q}&w=600`,

  /* ── grocery preset ── */
  fruitBasket: `https://images.unsplash.com/photo-1619566636858-adf3ef46400b${q}&w=1600`,
  eggsTray: `https://images.unsplash.com/photo-1506976785307-8732e854ad03${q}&w=900`,
  milkPour: `https://images.unsplash.com/photo-1550583724-b2692b85b150${q}&w=900`,
  honey: `https://images.unsplash.com/photo-1558642452-9d2a7deb7f62${q}&w=900`,
  breadLoaves: `https://images.unsplash.com/photo-1509440159596-0249088772ff${q}&w=900`,
  spices: `https://images.unsplash.com/photo-1596040033229-a9821ebd058d${q}&w=1200`,
  oil: `https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5${q}&w=600`,
  tomatoes: `https://images.unsplash.com/photo-1592924357228-91a4daadcfea${q}&w=400`,
  fish: `https://images.unsplash.com/photo-1510130387422-82bed34b37e9${q}&w=400`,
  rawChicken: `https://images.unsplash.com/photo-1587593810167-a84920ea0781${q}&w=400`,
  milkCarton: `https://images.unsplash.com/photo-1563636619-e9143da7973b${q}&w=400`,
  chips: `https://images.unsplash.com/photo-1566478989037-eec170784d0b${q}&w=400`,
  tea: `https://images.unsplash.com/photo-1571934811356-5cc061b6821f${q}&w=400`,
  cleanser: `https://images.unsplash.com/photo-1556228578-8c89e6adf883${q}&w=400`,

  /* ── electronics preset ── */
  gamingSetup: `https://images.unsplash.com/photo-1593640408182-31c70c8268f5${q}&w=1600`,
  laptopGlow: `https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2${q}&w=1600`,
  phoneDark: `https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb${q}&w=900`,
  headphonesDark: `https://images.unsplash.com/photo-1585298723682-7115561c51b7${q}&w=900`,
  smartTv: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1${q}&w=1200`,
  droneFold: `https://images.unsplash.com/photo-1507582020474-9a35b7d455d9${q}&w=1200`,
  ps5: `https://images.unsplash.com/photo-1606144042614-b2417e99c4e3${q}&w=600`,
  mechKeyboard: `https://images.unsplash.com/photo-1618384887929-16ec33fab9ef${q}&w=400`,
  camera: `https://images.unsplash.com/photo-1516035069371-29a1b244cc32${q}&w=400`,
  powerbank: `https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5${q}&w=400`,
  mouse: `https://images.unsplash.com/photo-1527864550417-7fd91fc51a46${q}&w=400`,
  tablet: `https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0${q}&w=400`,
  printer: `https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf${q}&w=400`,
  smartHome: `https://images.unsplash.com/photo-1558089687-f282ffcbc126${q}&w=400`,
  gpu: `https://images.unsplash.com/photo-1591488320449-011701bb6704${q}&w=600`,
};

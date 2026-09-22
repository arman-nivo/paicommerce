/**
 * Nest's default imagery — every URL is a verified Unsplash photo, checked by eye on a contact
 * sheet (run `node tools/verify-images.mjs themes/nest`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Rooms (landscape, warm)
  livingWarm: `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6${q}&w=2000`, // wide open-plan living room, grey sofa, terracotta poufs
  livingRattan: `https://images.unsplash.com/photo-1615529182904-14819c35db37${q}&w=1800`, // sage living room with rattan pendants, jute rug
  livingGreen: `https://images.unsplash.com/photo-1616046229478-9901c5536a45${q}&w=1800`, // sage wall, round mirror, rattan sideboard, patterned rug
  livingBeige: `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace${q}&w=1800`, // light beige living room, sectional
  livingBright: `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0${q}&w=1800`, // sunlit living, cognac sofa, gallery wall
  beigeLiving: `https://images.unsplash.com/photo-1631679706909-1844bbd07221${q}&w=1800`, // cream sofa, cane mirrors
  bohoLiving: `https://images.unsplash.com/photo-1618220179428-22790b461013${q}&w=1400`, // orange armchair, brass sideboard (portrait)
  rattanSideboard: `https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e${q}&w=1400`, // rattan sideboard, herringbone floor (portrait)
  juteLiving: `https://images.unsplash.com/photo-1583847268964-b28dc8f51f92${q}&w=1400`, // jute rug, wooden stools, knitted pouf (portrait)
  bedroomBoho: `https://images.unsplash.com/photo-1615874959474-d609969a20ed${q}&w=1800`, // sage bedroom with plants & rattan pendant
  luxBedroom: `https://images.unsplash.com/photo-1616594039964-ae9021a400a0${q}&w=1800`, // channel-tufted bed, brass chandelier
  bedRust: `https://images.unsplash.com/photo-1616627561839-074385245ff6${q}&w=1800`, // rust linen bedding, oak bed frame
  diningBoho: `https://images.unsplash.com/photo-1519643381401-22c77e60520e${q}&w=1800`, // sunny dining nook
  diningSet: `https://images.unsplash.com/photo-1577140917170-285929fb55b7${q}&w=1400`, // wooden dining set, ring pendant
  diningGreen: `https://images.unsplash.com/photo-1617806118233-18e1de247200${q}&w=1800`, // dining room with green velvet chairs
  officeGreen: `https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d${q}&w=1800`, // green home office
  homeOffice: `https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd${q}&w=1400`,
  studyDesk: `https://images.unsplash.com/photo-1611269154421-4e27233ac5c7${q}&w=1400`, // oak desk in sunlight
  // Products / objects
  greenSofa: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc${q}&w=1400`,
  floorLamp: `https://images.unsplash.com/photo-1507473885765-e6ed057f782c${q}&w=1200`,
  pendantLamp: `https://images.unsplash.com/photo-1513506003901-1e6a229e2d15${q}&w=1200`,
  whiteVase: `https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c${q}&w=1200`, // ceramic urn on marble plinth
  sideTable: `https://images.unsplash.com/photo-1611486212557-88be5ff6f941${q}&w=1200`, // solid-wood side table
  // Materials & craft
  walnutTable: `https://images.unsplash.com/photo-1487015307662-6ce6210680f1${q}&w=900`, // dark wood table & chair
  juteRug: `https://images.unsplash.com/photo-1583847268964-b28dc8f51f92${q}&w=900`,
  juteSwatch: `https://images.unsplash.com/photo-1583847268964-b28dc8f51f92${q}&w=600&h=600&crop=focalpoint&fp-x=0.5&fp-y=0.92&fp-z=2`, // close crop of the jute rug
  rugRoll: `https://images.unsplash.com/photo-1600166898405-da9535204843${q}&w=900`, // rolled hand-woven rug
  linenBed: `https://images.unsplash.com/photo-1616627561839-074385245ff6${q}&w=900`,
  copperLamp: `https://images.unsplash.com/photo-1542728928-1413d1894ed1${q}&w=900`, // copper / brass lamp
  rattanPendants: `https://images.unsplash.com/photo-1615529182904-14819c35db37${q}&w=900`,
  ceramic: `https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c${q}&w=900`,
  woodTurning: `https://images.unsplash.com/photo-1611021061285-16c871740efa${q}&w=1400`, // craftsman turning wood on a lathe
  brassWorkshop: `https://images.unsplash.com/photo-1606722590583-6951b5ea92ad${q}&w=1400`, // metalsmith with brass pots
  potteryWheel: `https://images.unsplash.com/photo-1493106641515-6b5631de4bb9${q}&w=1400`, // hands on a pottery wheel
  wardrobe: `https://images.unsplash.com/photo-1558997519-83ea9252edf8${q}&w=1200`, // solid wood wardrobe
};

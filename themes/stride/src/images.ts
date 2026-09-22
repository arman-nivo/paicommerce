/**
 * Stride's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/stride`). Merchants replace them in the customizer.
 */
const q = "?auto=format&fit=crop&q=80";

export const IMG = {
  // Hero & campaign
  heroRunners: `https://images.unsplash.com/photo-1552674605-db6ffd4facb5${q}&w=2000`,
  liftDark: `https://images.unsplash.com/photo-1605296867304-46d5465a13f1${q}&w=2000`,
  deadlift: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438${q}&w=1600`,
  gymBW: `https://images.unsplash.com/photo-1571902943202-507ec2618e8f${q}&w=1600`,
  battleRopes: `https://images.unsplash.com/photo-1599058917212-d750089bc07e${q}&w=1400`,
  kettlebellSwing: `https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3${q}&w=1400`,
  dumbbellHand: `https://images.unsplash.com/photo-1583454110551-21f2fa2afe61${q}&w=1200`,
  crunches: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b${q}&w=1400`,
  // Athletes
  pullup: `https://images.unsplash.com/photo-1526506118085-60ce8714f8c5${q}&w=1400`,
  womanBarbell: `https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5${q}&w=1400`,
  fitnessClass: `https://images.unsplash.com/photo-1518611012118-696072aa579a${q}&w=1400`,
  swimmer: `https://images.unsplash.com/photo-1530549387789-4c1017266635${q}&w=1400`,
  // Sports
  sprint: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211${q}&w=1400`,
  runStairs: `https://images.unsplash.com/photo-1476480862126-209bfaa8edc8${q}&w=1200`,
  runnerWhite: `https://images.unsplash.com/photo-1460353581641-37baddab0fa2${q}&w=1200`,
  batsman: `https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972${q}&w=1400`,
  footballKick: `https://images.unsplash.com/photo-1517466787929-bc90951d0974${q}&w=1200`,
  bootsBall: `https://images.unsplash.com/photo-1511886929837-354d827aae26${q}&w=1200`,
  stadium: `https://images.unsplash.com/photo-1540747913346-19e32dc3e97e${q}&w=2000`,
  yogaSunset: `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b${q}&w=1400`,
  yogaPose: `https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b${q}&w=1200`,
  yogaMat: `https://images.unsplash.com/photo-1592432678016-e910b452f9a2${q}&w=1200`,
  roadBikeBlack: `https://images.unsplash.com/photo-1532298229144-0ec0c57515c7${q}&w=1400`,
  fixie: `https://images.unsplash.com/photo-1485965120184-e220f721d03e${q}&w=1200`,
  badminton: `https://images.unsplash.com/photo-1626224583764-f87db24ac4ea${q}&w=1200`,
  // Product still-lifes
  shoeFlying: `https://images.unsplash.com/photo-1491553895911-0055eca6402d${q}&w=1400`,
  sneakerLime: `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa${q}&w=1400`,
  sneakerRed: `https://images.unsplash.com/photo-1542291026-7eec264c27ff${q}&w=1200`,
  meshShoes: `https://images.unsplash.com/photo-1562183241-b937e95585b6${q}&w=1200`,
  bandsDumbbells: `https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2${q}&w=1200`,
  bottle: `https://images.unsplash.com/photo-1602143407151-7111542de6e8${q}&w=1200`,
  // Activewear preset
  yellowTracksuit: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f${q}&w=1400`,
  greyJoggers: `https://images.unsplash.com/photo-1506629082955-511b1aa562c8${q}&w=1200`,
  blackTee: `https://images.unsplash.com/photo-1583743814966-8936f5b7be1a${q}&w=1200`,
  pinkSneaker: `https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2${q}&w=1200`,
  // Fitness & nutrition preset
  proteinShake: `https://images.unsplash.com/photo-1579722821273-0f6c7d44362f${q}&w=1200`,
  proteinPowder: `https://images.unsplash.com/photo-1593095948071-474c5cc2989d${q}&w=1200`,
  // People (reviews)
  avatar1: `https://images.unsplash.com/photo-1494790108377-be9c29b29330${q}&w=200`,
  avatar2: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d${q}&w=200`,
  avatar3: `https://images.unsplash.com/photo-1544005313-94ddf0286df2${q}&w=200`,
};

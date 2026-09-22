/**
 * Volt's default imagery. Every URL is a verified Unsplash photo
 * (run `node tools/verify-images.mjs themes/volt`). Merchants replace them in the customizer.
 */
const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

export const IMG = {
  // Hero & campaign
  heroPhone: u("photo-1605236453806-6ff36851218e", 1800),
  heroSetup: u("photo-1593640408182-31c70c8268f5", 2000),
  deskTech: u("photo-1498049794561-7780e7231661", 1600),
  techFlatlay: u("photo-1468495244123-6c6c332eeece", 1400),
  phoneDark: u("photo-1601784551446-20c9e07cdbdb", 1200),
  galaxyUltra: u("photo-1610945415295-d9bbf067e59c", 1200),
  iphonePro: u("photo-1592750475338-74b7b21085ab", 1200),
  laptopGlow: u("photo-1525547719571-a2d4ac8945e2", 1400),
  laptopSilver: u("photo-1611186871348-b1ce696e52c9", 1200),
  laptopRainbow: u("photo-1603302576837-37561b2e2302", 1200),
  headphonesAnc: u("photo-1618366712010-f4ae9c647dcb", 1200),
  headphonesDark: u("photo-1585298723682-7115561c51b7", 1200),
  headphonesKeyboard: u("photo-1550009158-9ebf69173e03", 1400),
  earbudsWhite: u("photo-1600294037681-c80b4cb5b434", 1000),
  speakerRgb: u("photo-1589003077984-894e133dabab", 1000),
  smartwatchBlack: u("photo-1546868871-7041f2a55e12", 1000),
  smartwatchWrist: u("photo-1508685096489-7aacd43bd3b1", 1000),
  ps5Controller: u("photo-1606144042614-b2417e99c4e3", 1200),
  gamingPc: u("photo-1587202372775-e229f172b9d7", 1400),
  gpu: u("photo-1591488320449-011701bb6704", 1200),
  mechKeyboard: u("photo-1618384887929-16ec33fab9ef", 1200),
  droneFold: u("photo-1507582020474-9a35b7d455d9", 1200),
  mirrorless: u("photo-1516035069371-29a1b244cc32", 1200),
  smartHome: u("photo-1558089687-f282ffcbc126", 1200),
  smartTv: u("photo-1593359677879-a4bb92f829d1", 1400),
  // Automotive preset
  autoGarage: u("photo-1492144534655-ae79c964c9d7", 2000),
  autoEngine: u("photo-1486262715619-67b85e0b08d3", 1200),
  autoOil: u("photo-1487754180451-c456f719a1fc", 1200),
  autoRoad: u("photo-1503376780353-7e6692767b70", 1400),
  autoMechanic: u("photo-1619642751034-765dfdf7c58e", 1200),
  // People (testimonials)
  avatar1: u("photo-1494790108377-be9c29b29330", 200),
  avatar2: u("photo-1507003211169-0a1dd7228f2d", 200),
  avatar3: u("photo-1544005313-94ddf0286df2", 200),
};

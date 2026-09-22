/**
 * Lumière's keyframes. Theme CSS is nested under `.pai-theme-lumiere`, where `@keyframes` is not
 * allowed, so they ship as a hoisted, de-duplicated React 19 <style> rendered by the header and hero.
 */
const KEYFRAMES = `@keyframes lumiere-kenburns { from { transform: scale(1.14) translate3d(0, 1.5%, 0); } to { transform: scale(1) translate3d(0, 0, 0); } } @keyframes lumiere-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes lumiere-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } } @keyframes lumiere-drip { 0% { transform: translateY(-100%); } 60%, 100% { transform: translateY(100%); } }`;

export function LumiereKeyframes() {
  return (
    <style href="lumiere-keyframes" precedence="default">
      {KEYFRAMES}
    </style>
  );
}

/**
 * Scope a theme's CSS under `.pai-theme-<slug>` using native CSS nesting, while hoisting
 * at-rules that are invalid inside a style rule (@keyframes, @font-face, @property, @import)
 * to the top level so themes can declare animations and fonts normally.
 */
const HOIST = /^@(-webkit-)?(keyframes|font-face|property|import|counter-style)\b/;

export function scopeThemeCss(slug: string, css: string | undefined): string {
  if (!css) return "";
  const hoisted: string[] = [];
  let rest = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf("@", i);
    if (at === -1) {
      rest += css.slice(i);
      break;
    }
    rest += css.slice(i, at);
    const head = css.slice(at, at + 40);
    if (!HOIST.test(head)) {
      rest += "@";
      i = at + 1;
      continue;
    }
    // `@import ...;` ends at the semicolon; block at-rules end at the matching brace.
    const semi = css.indexOf(";", at);
    const brace = css.indexOf("{", at);
    if (brace === -1 || (semi !== -1 && semi < brace)) {
      const end = semi === -1 ? css.length : semi + 1;
      hoisted.push(css.slice(at, end));
      i = end;
      continue;
    }
    let depth = 0;
    let j = brace;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}" && --depth === 0) break;
    }
    hoisted.push(css.slice(at, j + 1));
    i = j + 1;
  }
  const scoped = rest.trim() ? `.pai-theme-${slug}{${rest}}` : "";
  return hoisted.join("\n") + scoped;
}

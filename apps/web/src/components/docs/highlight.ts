/**
 * Tiny, dependency-free syntax highlighter for the docs.
 * Supports ts/tsx/js/jsx, json, bash/sh, http, css, python, php and a generic fallback.
 * Output: one array of tokens per line; the renderer maps token kinds to Tailwind colours.
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "type"
  | "tag"
  | "attr"
  | "property"
  | "punct"
  | "prompt"
  | "flag"
  | "variable"
  | "method";

export type Token = { kind: TokenKind; text: string };

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-slate-200",
  comment: "text-slate-500 italic",
  string: "text-emerald-300",
  keyword: "text-violet-300",
  number: "text-amber-300",
  function: "text-sky-300",
  type: "text-cyan-300",
  tag: "text-rose-300",
  attr: "text-amber-200",
  property: "text-sky-200",
  punct: "text-slate-400",
  prompt: "text-slate-500 select-none",
  flag: "text-amber-200",
  variable: "text-pink-300",
  method: "text-violet-300 font-semibold",
};

const JS_KEYWORDS = new Set(
  "abstract as async await break case catch class const continue debugger declare default delete do else enum export extends false finally for from function get if implements import in infer instanceof interface is keyof let new null of private protected public readonly return satisfies set static super switch this throw true try type typeof undefined unique var void while with yield".split(
    " ",
  ),
);
const PY_KEYWORDS = new Set(
  "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield".split(" "),
);
const PHP_KEYWORDS = new Set(
  "abstract and array as break case catch class clone const continue declare default do echo else elseif empty endif extends false final finally fn for foreach function global if implements include isset list match namespace new null or print private protected public require require_once return static switch throw true try use var while".split(
    " ",
  ),
);
const BASH_BUILTINS = new Set(
  "cd cp mv rm mkdir echo export source cat curl pnpm npm npx node git docker psql openssl caddy vercel sudo ls touch chmod set if then fi for do done in".split(" "),
);

type Lang = "js" | "json" | "bash" | "http" | "css" | "python" | "php" | "plain";

export function normalizeLang(lang: string | undefined): Lang {
  const l = (lang ?? "").toLowerCase();
  if (["ts", "tsx", "js", "jsx", "javascript", "typescript", "mjs", "cjs"].includes(l)) return "js";
  if (["json", "jsonc"].includes(l)) return "json";
  if (["bash", "sh", "shell", "zsh", "console", "terminal"].includes(l)) return "bash";
  if (l === "http") return "http";
  if (["css", "scss"].includes(l)) return "css";
  if (["py", "python"].includes(l)) return "python";
  if (l === "php") return "php";
  if (["env", "dotenv", "ini", "toml", "yaml", "yml", "dockerfile", "caddyfile", "nginx"].includes(l)) return "bash";
  return "plain";
}

/** Human label for the code-block header. */
export function langLabel(lang: string | undefined): string {
  const l = (lang ?? "").toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    mjs: "JavaScript",
    json: "JSON",
    bash: "Terminal",
    sh: "Terminal",
    shell: "Terminal",
    http: "HTTP",
    css: "CSS",
    python: "Python",
    py: "Python",
    php: "PHP",
    env: ".env",
    dotenv: ".env",
    yaml: "YAML",
    yml: "YAML",
    dockerfile: "Dockerfile",
    caddyfile: "Caddyfile",
    nginx: "nginx",
    txt: "Text",
    text: "Text",
  };
  return map[l] ?? (l ? l.toUpperCase() : "Code");
}

/* ─────────────────────────── scanner helpers ─────────────────────────── */

class Out {
  lines: Token[][] = [[]];
  push(kind: TokenKind, text: string) {
    const parts = text.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) this.lines.push([]);
      if (!p) return;
      const line = this.lines[this.lines.length - 1]!;
      const last = line[line.length - 1];
      if (last && last.kind === kind) last.text += p;
      else line.push({ kind, text: p });
    });
  }
}

function readString(src: string, i: number): number {
  const q = src[i]!;
  let j = i + 1;
  while (j < src.length) {
    const c = src[j]!;
    if (c === "\\") {
      j += 2;
      continue;
    }
    if (c === q) return j + 1;
    if (c === "\n" && q !== "`") return j;
    j++;
  }
  return j;
}

const isIdStart = (c: string | undefined) => !!c && /[A-Za-z_$]/.test(c);
const isId = (c: string | undefined) => !!c && /[\w$]/.test(c);
const isDigit = (c: string | undefined) => !!c && /[0-9]/.test(c);

function prevSignificant(src: string, i: number): string {
  let j = i - 1;
  while (j >= 0 && (src[j] === " " || src[j] === "\t")) j--;
  return j >= 0 ? src[j]! : "\n";
}

function prevWord(src: string, i: number): string {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j]!)) j--;
  const end = j + 1;
  while (j >= 0 && isId(src[j])) j--;
  return src.slice(j + 1, end);
}

function nextSignificant(src: string, i: number): string {
  let j = i;
  while (j < src.length && (src[j] === " " || src[j] === "\t")) j++;
  return src[j] ?? "";
}

/* ─────────────────────────── languages ─────────────────────────── */

function highlightJs(src: string, out: Out) {
  let i = 0;
  let inTag = false; // inside a JSX opening/closing tag (between `<Name` and `>`)
  let braceDepthInTag = 0;
  while (i < src.length) {
    const c = src[i]!;
    const n = src[i + 1];
    // comments
    if (c === "/" && n === "/") {
      const end = src.indexOf("\n", i);
      const j = end === -1 ? src.length : end;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? src.length : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    // strings
    if (c === '"' || c === "'" || c === "`") {
      const j = readString(src, i);
      out.push("string", src.slice(i, j));
      i = j;
      continue;
    }
    // JSX tag start: `<Name` or `</Name` or `<>` / `</>`
    if (c === "<" && !inTag) {
      const prev = prevSignificant(src, i);
      const pw = prevWord(src, i);
      const afterKeyword = pw === "return" || pw === "yield" || pw === "default" || pw === "case" || pw === "await";
      const looksLikeTag = (afterKeyword || (!isId(prev) && prev !== ")" && prev !== "]")) && (isIdStart(n) || n === "/" || n === ">");
      if (looksLikeTag) {
        let j = i + 1;
        if (src[j] === "/") j++;
        let k = j;
        while (k < src.length && /[\w.$-]/.test(src[k]!)) k++;
        out.push("punct", src.slice(i, j));
        if (k > j) out.push("tag", src.slice(j, k));
        i = k;
        inTag = true;
        braceDepthInTag = 0;
        continue;
      }
    }
    if (inTag && braceDepthInTag === 0) {
      if (c === ">" || (c === "/" && n === ">")) {
        const t = c === "/" ? "/>" : ">";
        out.push("punct", t);
        i += t.length;
        inTag = false;
        continue;
      }
      if (isIdStart(c)) {
        let j = i;
        while (j < src.length && /[\w$-]/.test(src[j]!)) j++;
        out.push("attr", src.slice(i, j));
        i = j;
        continue;
      }
      if (c === "{") {
        braceDepthInTag = 1;
        out.push("punct", c);
        i++;
        continue;
      }
    } else if (inTag) {
      if (c === "{") braceDepthInTag++;
      if (c === "}") {
        braceDepthInTag--;
        if (braceDepthInTag === 0) {
          out.push("punct", c);
          i++;
          continue;
        }
      }
    }
    // numbers
    if (isDigit(c) && !isId(src[i - 1])) {
      let j = i;
      while (j < src.length && /[\w.]/.test(src[j]!)) j++;
      out.push("number", src.slice(i, j));
      i = j;
      continue;
    }
    // identifiers
    if (isIdStart(c)) {
      let j = i;
      while (j < src.length && isId(src[j])) j++;
      const word = src.slice(i, j);
      const before = src[i - 1];
      const after = nextSignificant(src, j);
      let kind: TokenKind = "plain";
      if (JS_KEYWORDS.has(word) && before !== ".") kind = "keyword";
      else if (after === "(" ) kind = "function";
      else if (/^[A-Z]/.test(word)) kind = "type";
      else if (after === ":" && /[{,\s]/.test(prevSignificant(src, i)) && src[j] === ":") kind = "property";
      out.push(kind, word);
      i = j;
      continue;
    }
    if (/[{}()[\];,.:=<>+\-*/%!&|?^~]/.test(c)) {
      out.push("punct", c);
      i++;
      continue;
    }
    out.push("plain", c);
    i++;
  }
}

function highlightJson(src: string, out: Out) {
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      const j = end === -1 ? src.length : end;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === '"') {
      const j = readString(src, i);
      out.push(nextSignificant(src, j) === ":" ? "property" : "string", src.slice(i, j));
      i = j;
      continue;
    }
    if (isDigit(c) || (c === "-" && isDigit(src[i + 1]))) {
      let j = i + 1;
      while (j < src.length && /[\d.eE+-]/.test(src[j]!)) j++;
      out.push("number", src.slice(i, j));
      i = j;
      continue;
    }
    const m = /^(true|false|null)\b/.exec(src.slice(i, i + 5));
    if (m) {
      out.push("keyword", m[1]!);
      i += m[1]!.length;
      continue;
    }
    if (/[{}[\],:]/.test(c)) {
      out.push("punct", c);
      i++;
      continue;
    }
    out.push("plain", c);
    i++;
  }
}

function highlightBash(src: string, out: Out) {
  const lines = src.split("\n");
  lines.forEach((line, li) => {
    if (li > 0) out.push("plain", "\n");
    let i = 0;
    let atCommand = true;
    const prompt = /^(\$|>|#) (?=\S)/.exec(line);
    if (prompt && prompt[1] !== "#") {
      out.push("prompt", prompt[0]);
      i = prompt[0].length;
    }
    // KEY=value lines (.env files)
    const env = /^([A-Z][A-Z0-9_]*)(=)(.*)$/.exec(line);
    if (env && i === 0) {
      out.push("property", env[1]!);
      out.push("punct", env[2]!);
      if (env[3]) out.push(/^["']/.test(env[3]) ? "string" : "plain", env[3]);
      return;
    }
    while (i < line.length) {
      const c = line[i]!;
      if (c === "#" && (i === 0 || /\s/.test(line[i - 1]!))) {
        out.push("comment", line.slice(i));
        break;
      }
      if (c === '"' || c === "'") {
        const j = readString(line, i);
        out.push("string", line.slice(i, j));
        i = j;
        atCommand = false;
        continue;
      }
      if (c === "$" && /[A-Za-z_{(]/.test(line[i + 1] ?? "")) {
        let j = i + 1;
        if (line[j] === "{" || line[j] === "(") {
          const close = line[j] === "{" ? "}" : ")";
          const e = line.indexOf(close, j);
          j = e === -1 ? line.length : e + 1;
        } else while (j < line.length && /\w/.test(line[j]!)) j++;
        out.push("variable", line.slice(i, j));
        i = j;
        continue;
      }
      if (c === "-" && (i === 0 || /\s/.test(line[i - 1]!)) && /[-\w]/.test(line[i + 1] ?? "")) {
        let j = i;
        while (j < line.length && /[-\w=]/.test(line[j]!)) j++;
        out.push("flag", line.slice(i, j));
        i = j;
        continue;
      }
      if (/\s/.test(c)) {
        out.push("plain", c);
        i++;
        continue;
      }
      if (c === "|" || c === "&" || c === ";" || c === "\\" || c === ">" || c === "<") {
        out.push("punct", c);
        if (c !== "\\" && c !== ">" && c !== "<") atCommand = true;
        i++;
        continue;
      }
      let j = i;
      while (j < line.length && !/[\s|&;"']/.test(line[j]!)) j++;
      const word = line.slice(i, j);
      if (atCommand) {
        out.push(BASH_BUILTINS.has(word) || /^[\w./-]+$/.test(word) ? "function" : "plain", word);
        atCommand = false;
      } else out.push("plain", word);
      i = j;
    }
  });
}

function highlightHttp(src: string, out: Out) {
  const lines = src.split("\n");
  let inBody = false;
  const bodyLines: string[] = [];
  lines.forEach((line, li) => {
    if (inBody) {
      bodyLines.push(line);
      return;
    }
    if (li > 0) out.push("plain", "\n");
    const req = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(.*)$/.exec(line);
    const status = /^(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/.exec(line);
    const header = /^([A-Za-z][\w-]*)(:)(.*)$/.exec(line);
    if (req) {
      out.push("method", req[1]!);
      out.push("plain", req[2]!);
      out.push("string", req[3]!);
      out.push("punct", req[4]!);
    } else if (status) {
      out.push("keyword", status[1]!);
      out.push("plain", status[2]!);
      out.push("number", status[3]!);
      out.push("plain", status[4]!);
    } else if (header) {
      out.push("property", header[1]!);
      out.push("punct", header[2]!);
      out.push("plain", header[3]!);
    } else if (line.trim() === "") {
      inBody = true;
    } else out.push("plain", line);
  });
  if (bodyLines.length) {
    out.push("plain", "\n");
    highlightJson(bodyLines.join("\n"), out);
  }
}

function highlightCss(src: string, out: Out) {
  let i = 0;
  let depth = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? src.length : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = readString(src, i);
      out.push("string", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === "{" || c === "}") {
      depth += c === "{" ? 1 : -1;
      out.push("punct", c);
      i++;
      continue;
    }
    if (c === "@") {
      let j = i + 1;
      while (j < src.length && /[\w-]/.test(src[j]!)) j++;
      out.push("keyword", src.slice(i, j));
      i = j;
      continue;
    }
    if (depth > 0 && /[-\w]/.test(c)) {
      let j = i;
      while (j < src.length && /[-\w]/.test(src[j]!)) j++;
      const word = src.slice(i, j);
      const after = nextSignificant(src, j);
      if (after === ":" && src[j] !== "(" && /[;{\s]/.test(prevSignificant(src, i) + "")) out.push(word.startsWith("--") ? "variable" : "property", word);
      else if (word.startsWith("--")) out.push("variable", word);
      else if (/^-?\d/.test(word)) out.push("number", word);
      else if (src[j] === "(") out.push("function", word);
      else out.push("plain", word);
      i = j;
      continue;
    }
    if (depth === 0 && /[.#:\w-]/.test(c)) {
      let j = i;
      while (j < src.length && /[.#:\w-]/.test(src[j]!)) j++;
      out.push("tag", src.slice(i, j));
      i = j;
      continue;
    }
    out.push(/[;:,()]/.test(c) ? "punct" : "plain", c);
    i++;
  }
}

function highlightGeneric(src: string, out: Out, keywords: Set<string>, hashComments: boolean) {
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    const n = src[i + 1];
    if ((hashComments && c === "#") || (c === "/" && n === "/")) {
      const end = src.indexOf("\n", i);
      const j = end === -1 ? src.length : end;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? src.length : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = readString(src, i);
      out.push("string", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === "$" && isIdStart(n)) {
      let j = i + 1;
      while (j < src.length && isId(src[j])) j++;
      out.push("variable", src.slice(i, j));
      i = j;
      continue;
    }
    if (isDigit(c) && !isId(src[i - 1])) {
      let j = i;
      while (j < src.length && /[\w.]/.test(src[j]!)) j++;
      out.push("number", src.slice(i, j));
      i = j;
      continue;
    }
    if (isIdStart(c)) {
      let j = i;
      while (j < src.length && isId(src[j])) j++;
      const word = src.slice(i, j);
      const after = nextSignificant(src, j);
      out.push(keywords.has(word) ? "keyword" : after === "(" ? "function" : /^[A-Z]/.test(word) ? "type" : "plain", word);
      i = j;
      continue;
    }
    out.push(/[{}()[\];,.:=<>+\-*/%!&|?]/.test(c) ? "punct" : "plain", c);
    i++;
  }
}

export function highlight(code: string, lang: string | undefined): Token[][] {
  const out = new Out();
  const l = normalizeLang(lang);
  switch (l) {
    case "js":
      highlightJs(code, out);
      break;
    case "json":
      highlightJson(code, out);
      break;
    case "bash":
      highlightBash(code, out);
      break;
    case "http":
      highlightHttp(code, out);
      break;
    case "css":
      highlightCss(code, out);
      break;
    case "python":
      highlightGeneric(code, out, PY_KEYWORDS, true);
      break;
    case "php":
      highlightGeneric(code, out, PHP_KEYWORDS, true);
      break;
    default:
      out.push("plain", code);
  }
  return out.lines;
}

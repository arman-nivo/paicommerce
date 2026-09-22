/** DNS targets merchants point their custom domain at. */
export const CNAME_TARGET = "stores.paicommerce.com";
export const A_RECORD_IP = "76.76.21.21";
export const PLATFORM_DOMAIN = "paicommerce.com";

/** Common two-part public suffixes (so shop.com.bd is treated as an apex domain). */
const SECOND_LEVEL = new Set([
  "com.bd", "net.bd", "org.bd", "edu.bd", "gov.bd", "ac.bd", "info.bd", "co.bd", "mil.bd",
  "co.uk", "org.uk", "com.au", "co.in", "com.my", "com.sg", "com.pk", "co.nz", "com.np", "com.lk",
]);

export type ParsedDomain = { ok: true; domain: string } | { ok: false; error: string };

/** "HTTPS://WWW.Shop.com/path?x" → "www.shop.com". */
export function normalizeDomain(input: string): ParsedDomain {
  let d = input.trim().toLowerCase();
  if (!d) return { ok: false, error: "Enter a domain, e.g. www.yourshop.com" };
  d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // protocol
  d = d.split(/[/?#]/)[0]!; // path / query
  d = d.replace(/^.*@/, ""); // credentials
  d = d.replace(/:\d+$/, ""); // port
  d = d.replace(/\.+$/, ""); // trailing dot
  if (d.length > 253) return { ok: false, error: "That domain is too long." };
  const labels = d.split(".");
  if (labels.length < 2) return { ok: false, error: "Enter a full domain with an extension, e.g. yourshop.com" };
  const labelRe = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
  const tld = labels[labels.length - 1]!;
  if (!labels.every((l) => labelRe.test(l)) || (!/^[a-z]{2,63}$/.test(tld) && !/^xn--[a-z0-9-]+$/.test(tld)))
    return { ok: false, error: "That doesn't look like a valid domain. Use letters, numbers, dashes and dots only." };
  if (d === PLATFORM_DOMAIN || d.endsWith(`.${PLATFORM_DOMAIN}`)) return { ok: false, error: `You already have a free ${PLATFORM_DOMAIN} address. Enter a domain you own.` };
  if (SECOND_LEVEL.has(d)) return { ok: false, error: `Enter your full domain, e.g. yourshop.${d}` };
  if (d === "localhost" || /^\d+(\.\d+){3}$/.test(d)) return { ok: false, error: "Enter a domain name, not an IP address." };
  return { ok: true, domain: d };
}

/** Registrable (apex) part of a domain: "www.shop.com.bd" → "shop.com.bd". */
export function apexOf(domain: string): string {
  const labels = domain.split(".");
  const lastTwo = labels.slice(-2).join(".");
  const n = SECOND_LEVEL.has(lastTwo) ? 3 : 2;
  return labels.slice(-n).join(".");
}

export function isApex(domain: string): boolean {
  return apexOf(domain) === domain;
}

/** DNS "Host/Name" field for the record: "@" for apex, else the subdomain part ("www", "shop"). */
export function hostLabel(domain: string): string {
  const apex = apexOf(domain);
  return domain === apex ? "@" : domain.slice(0, -(apex.length + 1));
}

export type DnsRecord = { type: "A" | "CNAME"; host: string; value: string; note?: string };

export function requiredRecords(domain: string): DnsRecord[] {
  if (isApex(domain))
    return [
      { type: "A", host: "@", value: A_RECORD_IP, note: "Or use CNAME flattening / ALIAS / ANAME to " + CNAME_TARGET + " if your DNS provider supports it (e.g. Cloudflare)." },
      { type: "CNAME", host: "www", value: CNAME_TARGET, note: "Recommended, so www." + domain + " works too." },
    ];
  return [{ type: "CNAME", host: hostLabel(domain), value: CNAME_TARGET }];
}

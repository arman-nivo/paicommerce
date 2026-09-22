import { INTEGRATIONS, maskSecret, type IntegrationDef, type IntegrationField } from "@pai/core/integrations";
import { and, db, eq, inArray, storeIntegrations } from "@pai/db";
import { planAtLeast } from "./plan";
import { isSecretField } from "./secret";

/** Client-safe view of an integration. Secret (password) values are NEVER included — only a mask + hasValue flag. */
export type IntegrationView = {
  provider: string;
  type: IntegrationDef["type"];
  name: string;
  description: string;
  color: string;
  region: IntegrationDef["region"];
  plan: IntegrationDef["plan"] | null;
  popular: boolean;
  docsUrl: string | null;
  fields: IntegrationField[];
  /** A store_integrations row exists. */
  connected: boolean;
  enabled: boolean;
  /** COD with no row → enabled by default. */
  isDefault: boolean;
  locked: boolean;
  config: Record<string, string | boolean>;
  secrets: Record<string, { hasValue: boolean; masked: string }>;
};

export async function loadIntegrations(storeId: string, planCode: string, types: IntegrationDef["type"][]): Promise<IntegrationView[]> {
  const defs = INTEGRATIONS.filter((d) => types.includes(d.type));
  const rows = defs.length
    ? await db
        .select()
        .from(storeIntegrations)
        .where(and(eq(storeIntegrations.storeId, storeId), inArray(storeIntegrations.provider, defs.map((d) => d.provider))))
    : [];
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  return defs.map((def) => {
    const row = byProvider.get(def.provider);
    const config: Record<string, string | boolean> = {};
    const secrets: IntegrationView["secrets"] = {};
    for (const f of def.fields) {
      const raw = row?.config?.[f.key];
      if (isSecretField(f)) {
        const s = typeof raw === "string" ? raw : raw != null ? String(raw) : "";
        secrets[f.key] = { hasValue: !!s, masked: s ? maskSecret(s) : "" };
        config[f.key] = "";
      } else if (f.type === "toggle") {
        config[f.key] = raw === true || raw === "true";
      } else {
        config[f.key] = raw == null ? "" : String(raw);
      }
    }
    const isCod = def.provider === "cod";
    return {
      provider: def.provider,
      type: def.type,
      name: def.name,
      description: def.description,
      color: def.color,
      region: def.region,
      plan: def.plan ?? null,
      popular: !!def.popular,
      docsUrl: def.docsUrl ?? null,
      fields: def.fields,
      connected: !!row,
      enabled: row ? row.enabled : isCod,
      isDefault: isCod && !row,
      locked: !planAtLeast(planCode, def.plan),
      config,
      secrets,
    };
  });
}

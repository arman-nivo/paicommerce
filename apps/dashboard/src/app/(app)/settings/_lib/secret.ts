import type { IntegrationField } from "@pai/core/integrations";

/** Fields whose stored value must never be sent back to the browser. */
export function isSecretField(f: IntegrationField) {
  return f.type === "password" || (f.type === "textarea" && /private|secret/i.test(f.key));
}

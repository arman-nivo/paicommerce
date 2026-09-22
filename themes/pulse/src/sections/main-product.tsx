/**
 * Pulse's product page: the kit's `main-product` plus a "Pharmacy info" block — manufacturer and
 * dosage form, a prescription notice with an upload link for Rx items, and a pharmacist chat link.
 */
import type { SectionDefinition } from "@pai/theme-sdk";
import { SmartLink, bool, extendMainProduct, resolveHref, str, type ProductBlockExtension } from "@pai/theme-kit";
import { Factory, FileWarning, MessageCircle, Pill } from "lucide-react";
import { isRx } from "../components/card";
import { whatsappHref } from "../components/utils";

export const pharmacyInfoBlock: ProductBlockExtension = {
  schema: {
    type: "pharmacy_info",
    name: "Pharmacy info",
    limit: 1,
    settings: [
      { type: "checkbox", id: "show_meta", label: "Show manufacturer & dosage form", default: true },
      { type: "text", id: "rx_text", label: "Prescription notice", default: "This medicine requires a valid prescription. Upload it before or after ordering — our pharmacist will verify it." },
      { type: "text", id: "rx_link_label", label: "Upload link label", default: "Upload prescription" },
      { type: "url", id: "rx_link", label: "Upload link", default: "/pages/contact", info: "Leave empty to open WhatsApp." },
      { type: "text", id: "ask_label", label: "Pharmacist chat label", default: "Questions? Ask a pharmacist on WhatsApp" },
    ],
  },
  component: ({ block, product, context }) => {
    const s = block.settings;
    const rx = isRx(product);
    const wa = whatsappHref(context, "", `Hello {store}, I have a question about ${product.title}.`);
    const rxHref = resolveHref(context, s.rx_link) || whatsappHref(context, "", `Hello {store}, here is my prescription for ${product.title}.`);
    return (
      <div className="space-y-3">
        {bool(s.show_meta, true) && (product.vendor || product.productType) ? (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {product.vendor ? (
              <div className="flex items-center gap-2.5 rounded-pai bg-pai-muted px-3 py-2.5">
                <Factory className="size-4 shrink-0 text-pai-primary" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-[11px] opacity-60">Manufacturer</dt>
                  <dd className="truncate font-semibold">{product.vendor}</dd>
                </div>
              </div>
            ) : null}
            {product.productType ? (
              <div className="flex items-center gap-2.5 rounded-pai bg-pai-muted px-3 py-2.5">
                <Pill className="size-4 shrink-0 text-pai-primary" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-[11px] opacity-60">Form</dt>
                  <dd className="truncate font-semibold">{product.productType}</dd>
                </div>
              </div>
            ) : null}
          </dl>
        ) : null}
        {rx ? (
          <div role="note" className="flex gap-3 rounded-pai border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-950">
            <FileWarning className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>
              <span className="font-semibold">Prescription required. </span>
              {str(s.rx_text)}{" "}
              {rxHref && str(s.rx_link_label) ? (
                <SmartLink href={rxHref} className="font-semibold underline underline-offset-2">
                  {str(s.rx_link_label)}
                </SmartLink>
              ) : null}
            </p>
          </div>
        ) : null}
        {wa && str(s.ask_label) ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-pai-primary hover:underline">
            <MessageCircle className="size-4" aria-hidden /> {str(s.ask_label)}
          </a>
        ) : null}
      </div>
    );
  },
};

export const pulseMainProduct = (base: SectionDefinition<any>) => extendMainProduct([pharmacyInfoBlock], base);

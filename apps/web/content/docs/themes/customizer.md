---
title: Customizer integration
description: How the theme customizer previews your theme — section wrappers with data-pai-section, the postMessage preview protocol, isPreview placeholders and draft vs. published configs.
---

The **theme customizer** in the merchant dashboard (`Online store → Themes → Customize`) is a split view: a sidebar that edits the store's `ThemeConfig`, and an iframe showing the live storefront. You don't need to write any customizer code — but understanding how it works helps you build sections that feel great to edit.

## Draft and published configs

A store's installed theme (`store_themes` row) holds two documents:

| Column | Meaning |
| --- | --- |
| `config` | The **published** `ThemeConfig` that shoppers see. `null` = theme default + preset. |
| `draftConfig` | Unsaved customizer edits. `null` = no pending changes. |

While editing, the customizer saves changes to `draftConfig`. The preview iframe loads the store through a signed preview URL:

```text
http://localhost:3003/preview/{token}/            # home page
http://localhost:3003/preview/{token}/products/…  # any storefront path
```

The token is created by the dashboard (`signPreviewToken`) and identifies the store theme being edited. The preview renders `draftConfig ?? config` with `context.isPreview = true`. **Publish** copies the draft to `config` and clears the draft; shoppers see the change immediately (the store's cache tag is revalidated).

Because preview URLs live under `/preview/{token}`, links built with `context.url()` keep the merchant inside the preview as they click around. Hard-coded `/products/...` links would break out of it.

## Section wrappers

`RenderSections` wraps every section it renders:

```html
<div id="section-hero" data-pai-section="hero" data-pai-section-type="promo-banner" style="display: contents">
  <section>…your markup…</section>
</div>
```

Header and footer sections also carry `data-pai-group="header"` / `"footer"`. The customizer uses these attributes to:

- **highlight** the section under the mouse (and the one selected in the sidebar),
- **select** a section when the merchant clicks it in the preview,
- **scroll** the preview to a section when it's selected in the sidebar.

Your responsibilities are small:

- **Render a single root element.** Because the wrapper uses `display: contents`, the preview scrolls to your section's first element when it is selected. Fragments with several top-level siblings scroll and highlight unpredictably.
- **Don't reuse `section-{id}` ids** for your own elements.
- **Expect a preview badge.** The preview shows a small "Preview · changes are not live yet" pill in the bottom-left corner; don't place critical UI there.

## The preview protocol

The dashboard (parent window) and the storefront preview (iframe) talk over `window.postMessage`. The message types are exported from `@pai/theme-sdk/preview-protocol`:

```ts
import { isEditorMessage, isPreviewMessage, type EditorToPreview, type PreviewToEditor } from "@pai/theme-sdk/preview-protocol";

// Customizer → preview
type EditorToPreview =
  | { source: "pai-editor"; type: "refresh" }
  | { source: "pai-editor"; type: "select-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "hover-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "navigate"; path: string };

// Preview → customizer
type PreviewToEditor =
  | { source: "pai-preview"; type: "ready"; path: string; template: string }
  | { source: "pai-preview"; type: "section-click"; sectionId: string; group?: string }
  | { source: "pai-preview"; type: "navigated"; path: string; template: string };
```

| Message | When |
| --- | --- |
| `ready` | The preview page has loaded. Carries the current path and template so the sidebar shows the right section list. |
| `refresh` | The draft was saved; the preview re-renders the server components with the new config. |
| `select-section` / `hover-section` | The merchant selected or hovered a section in the sidebar; the preview outlines and scrolls to it. |
| `section-click` | The merchant clicked a section in the preview; the sidebar opens its settings. |
| `navigate` / `navigated` | The merchant switched template in the sidebar's page picker, or navigated inside the preview. |

The storefront implements the preview side for you. Theme code only needs the protocol if it builds custom preview behaviour — for example, a slideshow that jumps to the slide containing the selected block:

```tsx title="themes/monsoon/src/sections/slideshow/slideshow-client.tsx"
"use client";

import { useEffect } from "react";
import { isEditorMessage } from "@pai/theme-sdk/preview-protocol";

export function useSelectedSection(sectionId: string, onSelect: () => void) {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!isEditorMessage(e.data)) return;
      if (e.data.type === "select-section" && e.data.sectionId === sectionId) onSelect();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sectionId, onSelect]);
}
```

Only run this in preview mode — pass `context.isPreview` down as a prop and skip the listener otherwise.

## Designing for the customizer

### Placeholders when content is missing

A freshly added section must never be invisible. When required content is missing and `context.isPreview` is true, render a placeholder that tells the merchant what to do; in production, render nothing (or a graceful fallback):

```tsx
function ImageWithText({ settings, context }: SectionProps<{ image: string; heading: string }>) {
  if (!settings.image && !settings.heading) {
    if (!context.isPreview) return null;
    return (
      <section className="mx-auto max-w-[var(--pai-container)] px-4 py-16">
        <div className="grid h-64 place-items-center rounded-[var(--pai-radius)] border-2 border-dashed border-[var(--pai-border)] text-sm opacity-60">
          Add an image and a heading in the sidebar
        </div>
      </section>
    );
  }
  // …
}
```

Theme Kit sections use sample products and images from `@pai/theme-kit` as placeholders, so a product grid pointed at an empty collection still looks like a product grid in the preview.

### No side effects in preview

The preview is a real storefront render. Avoid anything that would pollute the merchant's data or analytics when `context.isPreview` is true: auto-opening popups, firing custom tracking pixels, or starting autoplaying video with sound. (Platform analytics and marketing pixels are already disabled in preview.)

### Fast re-renders

Every edit triggers a server re-render of the preview. Keep sections cheap: fetch only what you render, avoid heavy client-side initialisation, and don't block rendering on third-party scripts.

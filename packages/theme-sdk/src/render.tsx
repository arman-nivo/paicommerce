import type { SectionList, StorefrontContext, ThemeDefinition } from "./types";
import { getSection, resolveSectionSettings } from "./utils";

/**
 * Renders an ordered section list (a template or a header/footer group).
 * Works as a React Server Component; section components may be async.
 *
 * Each section is wrapped in an element carrying `data-pai-section` so the theme customizer
 * can highlight, select and scroll to it inside the preview iframe.
 */
export function RenderSections({
  theme,
  list,
  context,
  group,
}: {
  theme: ThemeDefinition;
  list: SectionList | undefined;
  context: StorefrontContext;
  group?: string;
}) {
  if (!list) return null;
  return (
    <>
      {list.order.map((id) => {
        const inst = list.sections[id];
        if (!inst || inst.disabled) return null;
        const def = getSection(theme, inst.type);
        if (!def) {
          return context.isPreview ? (
            <div key={id} data-pai-section={id} style={{ padding: 24, border: "2px dashed #f59e0b", color: "#92400e", fontFamily: "system-ui" }}>
              Unknown section type “{inst.type}”
            </div>
          ) : null;
        }
        const { settings, blocks } = resolveSectionSettings(def.schema, inst);
        const Component = def.component;
        return (
          <div
            key={id}
            id={`section-${id}`}
            data-pai-section={id}
            data-pai-section-type={inst.type}
            data-pai-group={group}
            style={{ display: "contents" }}
          >
            <Component id={id} settings={settings} blocks={blocks} context={context} />
          </div>
        );
      })}
    </>
  );
}

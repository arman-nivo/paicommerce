import type { BusinessCategory, SectionSchema, SettingsGroup, ThemeConfig, ThemeManifest, TemplateType } from "@pai/theme-sdk";

/** Serializable preset data handed to the customizer (JSON only). */
export type EditorPreset = {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string | null;
  thumbnail: string | null;
  settings: Record<string, unknown> | null;
  templates: ThemeConfig["templates"] | null;
  groups: Partial<ThemeConfig["groups"]> | null;
};

export type EditorStoreTheme = {
  id: string;
  name: string;
  role: "live" | "unpublished";
  themeSlug: string;
  presetId: string | null;
  updatedAt: string;
  publishedAt: string | null;
  /** True when the row has a published config (so "discard draft" makes sense). */
  hasPublishedConfig: boolean;
  /** True when there are saved-but-unpublished changes. */
  hasDraft: boolean;
};

/** Everything the (client) customizer needs — plain JSON, no components. */
export type EditorData = {
  manifest: ThemeManifest;
  settingsSchema: SettingsGroup[];
  sectionSchemas: SectionSchema[];
  presets: EditorPreset[];
  config: ThemeConfig;
  storeTheme: EditorStoreTheme;
  previewToken: string;
  storefrontUrl: string;
  storeUrl: string;
  /** Resolved preview path for each template (placeholders filled with real slugs). */
  templatePaths: Record<TemplateType, string>;
  /** Name of the currently live theme when it is a different row. */
  liveThemeName: string | null;
};

/** Where a section lives: a header/footer group or a template. */
export type ListRef = { kind: "group"; key: "header" | "footer" } | { kind: "template"; key: TemplateType };

export type Selection =
  | { kind: "section"; list: ListRef; sectionId: string }
  | { kind: "block"; list: ListRef; sectionId: string; blockId: string }
  /** Global theme settings; `group` = the accordion opened initially (-1 = none). */
  | { kind: "theme"; group: number }
  | null;

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export type Viewport = "desktop" | "tablet" | "mobile";

export type PickerProduct = { slug: string; title: string; image: string | null; status?: string };
export type PickerCollection = { slug: string; title: string; image: string | null };
export type PickerMenu = { handle: string; title: string; count: number };
export type PickerPage = { slug: string; title: string };

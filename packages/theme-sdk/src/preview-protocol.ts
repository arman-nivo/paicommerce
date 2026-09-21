/**
 * postMessage protocol between the dashboard theme customizer (parent window)
 * and the storefront preview (iframe).
 */
export type EditorToPreview =
  | { source: "pai-editor"; type: "refresh" }
  | { source: "pai-editor"; type: "select-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "hover-section"; sectionId: string | null }
  | { source: "pai-editor"; type: "navigate"; path: string };

export type PreviewToEditor =
  | { source: "pai-preview"; type: "ready"; path: string; template: string }
  | { source: "pai-preview"; type: "section-click"; sectionId: string; group?: string }
  | { source: "pai-preview"; type: "navigated"; path: string; template: string };

export function isEditorMessage(d: unknown): d is EditorToPreview {
  return !!d && typeof d === "object" && (d as { source?: string }).source === "pai-editor";
}
export function isPreviewMessage(d: unknown): d is PreviewToEditor {
  return !!d && typeof d === "object" && (d as { source?: string }).source === "pai-preview";
}

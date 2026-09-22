import type { Modifier } from "@dnd-kit/core";

/** Lock dragging to the vertical axis (lists in the customizer sidebar). */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

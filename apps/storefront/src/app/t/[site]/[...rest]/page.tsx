import { notFound } from "next/navigation";

/** Any unknown store path → the theme's 404 template (see ../not-found.tsx). */
export default function CatchAll() {
  notFound();
}

import { redirect } from "next/navigation";
import { destroySession } from "@pai/core/session";

export async function GET() {
  await destroySession();
  redirect("/login");
}

export async function POST() {
  await destroySession();
  redirect("/login");
}

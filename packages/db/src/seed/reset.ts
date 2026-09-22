/** Drops and recreates the public schema. `pnpm db:reset` = reset → drizzle-kit push → seed. */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;`);
  await sql.unsafe(`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
  console.log("✓ Dropped and recreated schema 'public'");
} finally {
  await sql.end();
}

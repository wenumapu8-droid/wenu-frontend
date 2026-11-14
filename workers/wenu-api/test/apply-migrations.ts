import { applyD1Migrations, env } from "cloudflare:test";

type Migration = { name: string; queries: string[] };

const migrations = (env as Env & { TEST_MIGRATIONS?: Migration[] }).TEST_MIGRATIONS;
if (!migrations) throw new Error("TEST_MIGRATIONS binding is missing");
await applyD1Migrations(env.DB, migrations);

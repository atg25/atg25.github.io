import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

run("npx", ["prisma", "generate"]);

if (hasDatabaseUrl) {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("node", ["scripts/sync-posts.mjs"]);
} else {
  console.warn("[build] DATABASE_URL not set; skipping prisma migrate deploy and post sync.");
}

run("next", ["build"]);

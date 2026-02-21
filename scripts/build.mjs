import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    const cmd = [command, ...args].join(" ");
    throw new Error(`Command failed: ${cmd}`);
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const strictDbBuild = process.env.STRICT_DB_BUILD === "true";

run("npx", ["prisma", "generate"]);

if (hasDatabaseUrl) {
  try {
    run("npx", ["prisma", "migrate", "deploy"]);
    run("node", ["scripts/sync-posts.mjs"]);
  } catch (error) {
    if (strictDbBuild) {
      throw error;
    }

    console.warn(
      "[build] Database step failed. Continuing build because STRICT_DB_BUILD is not set to true.",
    );
    console.warn("[build]", error instanceof Error ? error.message : error);
  }
} else {
  console.warn(
    "[build] DATABASE_URL not set; skipping prisma migrate deploy and post sync.",
  );
}

run("next", ["build"]);

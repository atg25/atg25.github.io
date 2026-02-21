import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

function normalizeDatabaseUrl(urlValue) {
  if (!urlValue) {
    return urlValue;
  }

  try {
    const parsed = new URL(urlValue);
    const isSupabasePooler = parsed.hostname.includes("pooler.supabase.com");

    if (!isSupabasePooler) {
      return urlValue;
    }

    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    if (parsed.port === "6543") {
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }

      if (!parsed.searchParams.has("connection_limit")) {
        parsed.searchParams.set("connection_limit", "1");
      }
    }

    return parsed.toString();
  } catch {
    return urlValue;
  }
}

const runtimeDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(runtimeDatabaseUrl
      ? {
          datasources: {
            db: {
              url: runtimeDatabaseUrl,
            },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const postsDir = path.join(process.cwd(), "posts");

async function syncPosts() {
  const entries = fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".md"));

  for (const fileName of entries) {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDir, fileName);
    const source = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(source);

    const title =
      typeof data.title === "string" && data.title.trim()
        ? data.title.trim()
        : slug;

    await prisma.post.upsert({
      where: { slug },
      update: { title },
      create: { slug, title },
    });
  }

  console.log(`[sync-posts] Synced ${entries.length} posts.`);
}

syncPosts()
  .catch((error) => {
    console.error("[sync-posts] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

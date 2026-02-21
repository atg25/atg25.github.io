import { prisma } from "./prisma";
import { getPostData } from "./posts";

export class PostNotFoundError extends Error {
  constructor(slug) {
    super(`Post not found for slug: ${slug}`);
    this.name = "PostNotFoundError";
  }
}

export async function ensurePostRecord(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("A valid post slug is required.");
  }

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new Error("A valid post slug is required.");
  }

  let title = normalizedSlug;

  try {
    const postData = await getPostData(normalizedSlug);
    title = postData?.title || normalizedSlug;
  } catch {
    throw new PostNotFoundError(normalizedSlug);
  }

  return prisma.post.upsert({
    where: { slug: normalizedSlug },
    update: { title },
    create: {
      slug: normalizedSlug,
      title,
    },
  });
}

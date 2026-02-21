import { prisma } from "../../lib/prisma";
import { ensurePostRecord, PostNotFoundError } from "../../lib/posts-db";
import { requireUserSession } from "../../lib/server-auth";
import { getCurrentUserBySession } from "../../lib/current-user";
import { checkRateLimit } from "../../lib/rate-limit";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { postSlug } = req.query;

    if (!postSlug || typeof postSlug !== "string") {
      return badRequest(res, "postSlug is required.");
    }

    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true },
    });

    if (!post) {
      return res.status(200).json({ comments: [] });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ comments });
  }

  if (req.method === "POST") {
    const rate = checkRateLimit(req, {
      keyPrefix: "comments-post",
      limit: 20,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfterSec));
      return res
        .status(429)
        .json({ error: "Too many requests. Please slow down." });
    }

    const session = await requireUserSession(req, res);
    if (!session) return;

    const { postSlug, content } = req.body || {};

    if (!postSlug || typeof postSlug !== "string") {
      return badRequest(res, "postSlug is required.");
    }

    if (!content || typeof content !== "string") {
      return badRequest(res, "content is required.");
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
      return badRequest(
        res,
        "Comment length must be between 1 and 2000 characters.",
      );
    }

    const currentUser = await getCurrentUserBySession(session);
    if (!currentUser) {
      return res
        .status(401)
        .json({ error: "User not found for this session." });
    }

    try {
      const post = await ensurePostRecord(postSlug);

      const comment = await prisma.comment.create({
        data: {
          content: trimmedContent,
          userId: currentUser.id,
          postId: post.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      });

      return res.status(201).json({ comment });
    } catch (error) {
      if (error instanceof PostNotFoundError) {
        return res.status(404).json({ error: "Post not found." });
      }
      return res.status(500).json({ error: "Failed to create comment." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}

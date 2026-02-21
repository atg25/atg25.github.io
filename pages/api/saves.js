import { prisma } from "../../lib/prisma";
import { ensurePostRecord } from "../../lib/posts-db";
import { requireUserSession } from "../../lib/server-auth";
import { getCurrentUserBySession } from "../../lib/current-user";

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
      return res.status(200).json({ saved: false });
    }

    const session = await requireUserSession(req, res);
    if (!session) return;

    const user = await getCurrentUserBySession(session);
    if (!user) {
      return res.status(401).json({ error: "User not found for this session." });
    }

    const save = await prisma.save.findUnique({
      where: { userId_postId: { userId: user.id, postId: post.id } },
    });

    return res.status(200).json({ saved: Boolean(save) });
  }

  if (req.method === "POST") {
    const session = await requireUserSession(req, res);
    if (!session) return;

    const { postSlug } = req.body || {};
    if (!postSlug || typeof postSlug !== "string") {
      return badRequest(res, "postSlug is required.");
    }

    const user = await getCurrentUserBySession(session);
    if (!user) {
      return res.status(401).json({ error: "User not found for this session." });
    }

    try {
      const post = await ensurePostRecord(postSlug);
      const compositeKey = { userId: user.id, postId: post.id };

      const existing = await prisma.save.findUnique({
        where: { userId_postId: compositeKey },
      });

      if (existing) {
        await prisma.save.delete({ where: { userId_postId: compositeKey } });
      } else {
        await prisma.save.create({
          data: { userId: user.id, postId: post.id },
        });
      }

      return res.status(200).json({ saved: !existing });
    } catch {
      return res.status(500).json({ error: "Failed to toggle save." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}

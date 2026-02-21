import { prisma } from "../../../lib/prisma";
import { requireUserSession } from "../../../lib/server-auth";
import { getCurrentUserBySession } from "../../../lib/current-user";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await requireUserSession(req, res);
  if (!session) return;

  const currentUser = await getCurrentUserBySession(session);
  if (!currentUser) {
    return res.status(401).json({ error: "User not found for this session." });
  }

  try {
    const [savedPosts, likedPosts, comments] = await Promise.all([
      prisma.save.findMany({
        where: { userId: currentUser.id },
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.like.findMany({
        where: { userId: currentUser.id },
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.findMany({
        where: { userId: currentUser.id },
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.status(200).json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        profilePicture: currentUser.profilePicture,
      },
      savedPosts,
      likedPosts,
      comments,
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
}

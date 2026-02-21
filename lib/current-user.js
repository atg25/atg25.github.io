import { prisma } from "./prisma";

export async function getCurrentUserBySession(session) {
  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

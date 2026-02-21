import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function requireUserSession(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }

  return session;
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

export type AuthPayload = { userId: string };

export async function authMiddleware(
  req: Request & { user?: AuthPayload },
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.user = { userId: decoded.sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, createdAt: true },
  });
}

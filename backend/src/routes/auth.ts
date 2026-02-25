import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

const registerSchema = z.object({
  username: z.string().min(2, { error: "Username must be at least 2 characters" }),
  email: z.email({ error: "Invalid email" }),
  password: z.string().min(8, { error: "Password must be at least 8 characters" }),
});

const loginSchema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z.string().min(1, { error: "Password required" }),
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as string) ?? "unknown";
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return res.status(400).json({ error: fieldErrors });
    }
    const { username, email, password } = parsed.data;

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });
    if (existingUsername) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as string) ?? "unknown";
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return res.status(400).json({ error: fieldErrors });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// GET /auth/me — current user (requires Authorization: Bearer <token>)
router.get("/me", authMiddleware, async (req, res) => {
  const payload = (req as unknown as { user: { userId: string } }).user;
  const user = await getCurrentUser(payload.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

export default router;

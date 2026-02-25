import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Magic All Rounder API", health: "/health", db: "/db", users: "/db/users" });
});

app.use("/auth", authRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$connect();
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "disconnected", error: String(err) });
  }
});

// GET /db — show DB status and basic counts (no sensitive data)
app.get("/db", async (_req, res) => {
  try {
    await prisma.$connect();
    const [userCount, deckCount] = await Promise.all([
      prisma.user.count(),
      prisma.deck.count(),
    ]);
    res.json({
      db: "connected",
      counts: { users: userCount, decks: deckCount },
    });
  } catch (err) {
    res.status(503).json({
      db: "disconnected",
      error: String(err),
    });
  }
});

// GET /db/users — list users (id, email, createdAt only; no passwords)
app.get("/db/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    res.status(503).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

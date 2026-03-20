import "dotenv/config";
import express from "express";
import cors from "cors";
import cardsRoutes from "./routes/cards";
import commandersRoutes, { warmCommanderCache } from "./routes/commanders";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Magic All Rounder API", health: "/health" });
});

app.use("/api/cards", cardsRoutes);
app.use("/api/commanders", commandersRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  warmCommanderCache().catch(() => {});
});

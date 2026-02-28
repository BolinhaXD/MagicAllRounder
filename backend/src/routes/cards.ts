import { Router, Request, Response } from "express";

const router = Router();
const SCRYFALL_RANDOM = "https://api.scryfall.com/cards/random";

// GET /api/cards/random — fetch one random MTG card from Scryfall
router.get("/random", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(SCRYFALL_RANDOM);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Scryfall request failed",
        details: text || response.statusText,
      });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({
      error: "Failed to fetch random card",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;

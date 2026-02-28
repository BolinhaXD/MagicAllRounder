import { Router, Request, Response } from "express";

const router = Router();

const SCRYFALL_SEARCH =
  "https://api.scryfall.com/cards/search?q=is:commander+legal:commander+game:paper&unique=cards&order=released";

type ScryfallCard = {
  id: string;
  name: string;
  cmc: number;
  power?: string;
  toughness?: string;
  colors?: string[];
  image_uris?: { normal: string; small: string };
  card_faces?: Array<{
    power?: string;
    toughness?: string;
    colors?: string[];
    image_uris?: { normal: string; small: string };
  }>;
};

let cachedCommanders: ScryfallCard[] = [];
let cacheReady = false;

async function fetchAllCommanders(): Promise<ScryfallCard[]> {
  if (cacheReady) return cachedCommanders;
  const commanders: ScryfallCard[] = [];
  let url: string | null = SCRYFALL_SEARCH;
  while (url) {
    const res = await fetch(url);
    const data = (await res.json()) as {
      data?: ScryfallCard[];
      has_more?: boolean;
      next_page?: string;
    };
    if (data.data) commanders.push(...data.data);
    url = data.has_more && data.next_page ? data.next_page : null;
    if (url) await new Promise((r) => setTimeout(r, 100));
  }
  cachedCommanders = commanders;
  cacheReady = true;
  return commanders;
}

function getCommandersByManaValue(
  array: ScryfallCard[],
  manaValue: number
): ScryfallCard[] {
  if (typeof manaValue !== "number" || Number.isNaN(manaValue)) return array;
  return array.filter((c) => c.cmc === manaValue);
}

function getCommandersByPower(
  array: ScryfallCard[],
  power: number
): ScryfallCard[] {
  if (typeof power !== "number" || Number.isNaN(power)) return array;
  const p = String(power);
  return array.filter(
    (c) =>
      c.power === p ||
      (c.card_faces?.some((f) => f.power === p) ?? false)
  );
}

function getCommandersByToughness(
  array: ScryfallCard[],
  toughness: number
): ScryfallCard[] {
  if (typeof toughness !== "number" || Number.isNaN(toughness)) return array;
  const t = String(toughness);
  return array.filter(
    (c) =>
      c.toughness === t ||
      (c.card_faces?.some((f) => f.toughness === t) ?? false)
  );
}

function getCommandersByIncludingColor(
  array: ScryfallCard[],
  colors: string[]
): ScryfallCard[] {
  if (!colors.length) return array;
  return array.filter(
    (c) =>
      colors.every((color) => c.colors?.includes(color)) ||
      (c.card_faces?.some((f) =>
        colors.every((color) => f.colors?.includes(color))
      ) ?? false)
  );
}

function getCommandersByExactColor(
  array: ScryfallCard[],
  colors: string[]
): ScryfallCard[] {
  if (!colors.length) return array;
  return array.filter((c) => {
    const cardColors =
      c.colors ?? c.card_faces?.flatMap((f) => f.colors ?? []) ?? [];
    const unique = [...new Set(cardColors)];
    return (
      unique.length === colors.length &&
      colors.every((color) => unique.includes(color))
    );
  });
}

function getRandomCommander(array: ScryfallCard[]): ScryfallCard | null {
  if (!array.length) return null;
  return array[Math.floor(Math.random() * array.length)] ?? null;
}

function isInList(list: ScryfallCard[], card: ScryfallCard): boolean {
  return list.some((c) => c.id === card.id);
}

type RandomCommandersBody = {
  cmc?: number | string;
  power?: number | string;
  toughness?: number | string;
  numberCommanders: number;
  colors?: string[];
  includingColors?: "exactly" | "including";
};

// POST /api/commanders/random — filter cached commanders and return N random
router.post("/random", async (req: Request, res: Response) => {
  try {
    const body = req.body as RandomCommandersBody;
    const numberCommanders = Math.min(
      10,
      Math.max(1, Number(body.numberCommanders) || 1)
    );
    const rawCmc =
      body.cmc !== undefined && body.cmc !== ""
        ? Number(body.cmc)
        : NaN;
    const rawPower =
      body.power !== undefined && body.power !== ""
        ? Number(body.power)
        : NaN;
    const rawToughness =
      body.toughness !== undefined && body.toughness !== ""
        ? Number(body.toughness)
        : NaN;
    const cmc = Number.isNaN(rawCmc) ? NaN : Math.min(16, Math.max(0, rawCmc));
    const power = Number.isNaN(rawPower)
      ? NaN
      : Math.min(20, Math.max(0, rawPower));
    const toughness = Number.isNaN(rawToughness)
      ? NaN
      : Math.min(20, Math.max(0, rawToughness));
    const selectedColors = Array.isArray(body.colors) ? body.colors : [];
    const includingColors =
      body.includingColors === "including" ? "including" : "exactly";

    let list = await fetchAllCommanders();
    list = getCommandersByManaValue(list, cmc);
    list = getCommandersByPower(list, power);
    list = getCommandersByToughness(list, toughness);
    if (includingColors === "including") {
      list = getCommandersByIncludingColor(list, selectedColors);
    } else {
      list = getCommandersByExactColor(list, selectedColors);
    }

    const commanders: ScryfallCard[] = [];
    const maxN = Math.min(list.length, numberCommanders);
    while (commanders.length < maxN) {
      const commander = getRandomCommander(list);
      if (!commander) break;
      if (!isInList(commanders, commander)) commanders.push(commander);
    }

    res.json({ commanders });
  } catch (err) {
    res.status(500).json({
      error: "Failed to get random commanders",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;

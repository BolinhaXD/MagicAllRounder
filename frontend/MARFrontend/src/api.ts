const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const SCRYFALL_SEARCH =
  "https://api.scryfall.com/cards/search?q=is:commander+legal:commander+game:paper&unique=cards&order=released";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(
      message.includes("fetch") || message.includes("Failed")
        ? "Cannot reach server. Is the backend running at " + API_BASE + "?"
        : message
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg: string;
    if (typeof data.error === "string") {
      msg = data.error;
    } else if (data.error && typeof data.error === "object") {
      const err = data.error as Record<string, string[] | undefined>;
      const parts = [
        err.username?.[0],
        err.email?.[0],
        err.password?.[0],
      ].filter(Boolean);
      msg = parts.length > 0 ? parts.join(" ") : res.statusText || `Error ${res.status}`;
    } else {
      msg = (data.message as string) || data.error || res.statusText || `Error ${res.status}`;
    }
    throw new Error(msg);
  }
  return data as T;
}

export type CommanderCard = {
  id: string;
  name: string;
  oracle_text?: string;
  layout?: string;
  cmc: number;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity?: string[];
  image_uris?: { normal: string; small: string };
  card_faces?: Array<{
    name?: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
    colors?: string[];
    image_uris?: { normal: string; small: string };
  }>;
};

export type RandomCommandersBody = {
  cmc?: number;
  power?: number;
  toughness?: number;
  numberCommanders: number;
  colors?: string[];
  includingColors?: "exactly" | "including";
};

function byManaValue(cards: CommanderCard[], manaValue?: number): CommanderCard[] {
  if (typeof manaValue !== "number" || Number.isNaN(manaValue)) return cards;
  return cards.filter((c) => c.cmc === manaValue);
}

function byPower(cards: CommanderCard[], power?: number): CommanderCard[] {
  if (typeof power !== "number" || Number.isNaN(power)) return cards;
  const p = String(power);
  return cards.filter(
    (c) => c.power === p || (c.card_faces?.some((f) => f.power === p) ?? false)
  );
}

function byToughness(cards: CommanderCard[], toughness?: number): CommanderCard[] {
  if (typeof toughness !== "number" || Number.isNaN(toughness)) return cards;
  const t = String(toughness);
  return cards.filter(
    (c) => c.toughness === t || (c.card_faces?.some((f) => f.toughness === t) ?? false)
  );
}

function byIncludingIdentity(cards: CommanderCard[], colors: string[]): CommanderCard[] {
  if (!colors.length) return cards;
  return cards.filter((c) => {
    const id = c.color_identity ?? [];
    return colors.every((color) => id.includes(color));
  });
}

function byExactIdentity(cards: CommanderCard[], colors: string[]): CommanderCard[] {
  if (!colors.length) return cards;
  const wanted = [...new Set(colors)].sort();
  return cards.filter((c) => {
    const id = [...new Set(c.color_identity ?? [])].sort();
    return id.length === wanted.length && wanted.every((color, i) => color === id[i]);
  });
}

function pickRandomUnique(cards: CommanderCard[], n: number): CommanderCard[] {
  const source = [...cards];
  const out: CommanderCard[] = [];
  const maxN = Math.min(source.length, n);
  while (out.length < maxN) {
    const index = Math.floor(Math.random() * source.length);
    const [picked] = source.splice(index, 1);
    if (picked) out.push(picked);
  }
  return out;
}

async function fetchAllCommandersFromScryfall(): Promise<CommanderCard[]> {
  const all: CommanderCard[] = [];
  let url: string | null = SCRYFALL_SEARCH;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load cards from Scryfall");
    const data = (await res.json()) as {
      data?: CommanderCard[];
      has_more?: boolean;
      next_page?: string;
    };
    if (Array.isArray(data.data)) all.push(...data.data);
    url = data.has_more && data.next_page ? data.next_page : null;
    if (url) await new Promise((r) => setTimeout(r, 100));
  }
  return all;
}

async function randomCommandersFallback(
  body: RandomCommandersBody
): Promise<{ commanders: CommanderCard[] }> {
  const all = await fetchAllCommandersFromScryfall();
  const numberCommanders = Math.min(10, Math.max(1, Number(body.numberCommanders) || 1));
  const selectedColors = Array.isArray(body.colors) ? body.colors : [];
  const mode = body.includingColors === "including" ? "including" : "exactly";
  const wantsColorless = selectedColors.includes("C");
  const nonColorless = selectedColors.filter((c) => c !== "C");

  let list = byManaValue(all, body.cmc);
  list = byPower(list, body.power);
  list = byToughness(list, body.toughness);

  if (wantsColorless) {
    list =
      nonColorless.length > 0
        ? []
        : list.filter((c) => (c.color_identity?.length ?? 0) === 0);
  } else {
    list =
      mode === "including"
        ? byIncludingIdentity(list, nonColorless)
        : byExactIdentity(list, nonColorless);
  }

  return { commanders: pickRandomUnique(list, numberCommanders) };
}

export const commanders = {
  random: async (body: RandomCommandersBody) => {
    try {
      return await api<{ commanders: CommanderCard[] }>("/api/commanders/random", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const isReachabilityIssue =
        msg.includes("Cannot reach server") ||
        msg.includes("Failed to fetch") ||
        msg.includes("Network");
      if (!isReachabilityIssue) throw error;
      return randomCommandersFallback(body);
    }
  },
};

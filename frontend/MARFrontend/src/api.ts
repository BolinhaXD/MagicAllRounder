const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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

// Scryfall card shape (subset we use)
export type RandomCard = {
  name: string;
  type_line: string;
  oracle_text?: string;
  image_uris?: { normal: string; small: string };
};

export const cards = {
  random: () => api<RandomCard>("/api/cards/random"),
};

export type CommanderCard = {
  id: string;
  name: string;
  oracle_text?: string;
  layout?: string;
  colors?: string[];
  color_identity?: string[];
  image_uris?: { normal: string; small: string };
  card_faces?: Array<{
    name?: string;
    oracle_text?: string;
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

export const commanders = {
  random: (body: RandomCommandersBody) =>
    api<{ commanders: CommanderCard[] }>("/api/commanders/random", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

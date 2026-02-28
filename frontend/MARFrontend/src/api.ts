const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type User = { id: string; username?: string | null; email: string };

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
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

export const auth = {
  register: (username: string, email: string, password: string) =>
    api<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
      token: null,
    }),
  login: (email: string, password: string) =>
    api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  me: () => api<{ user: User }>("/auth/me"),
};

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
  image_uris?: { normal: string; small: string };
  card_faces?: Array<{ image_uris?: { normal: string; small: string } }>;
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

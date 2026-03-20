import { useState } from "react";
import type { FormEvent } from "react";
import Layout from "../components/Layout";
import { commanders, type CommanderCard, type RandomCommandersBody } from "../api";
import "./Pages.css";

function commanderImageUrl(c: CommanderCard): string {
  if (c.image_uris?.normal) return c.image_uris.normal;
  if (c.card_faces?.[0]?.image_uris?.normal) return c.card_faces[0].image_uris.normal;
  return "";
}

function commanderBackImageUrl(c: CommanderCard): string {
  if (c.card_faces?.[1]?.image_uris?.normal) return c.card_faces[1].image_uris.normal;
  return "";
}

function commanderFrontName(c: CommanderCard): string {
  return c.card_faces?.[0]?.name ?? c.name;
}

function commanderFrontOracleText(c: CommanderCard): string {
  return c.card_faces?.[0]?.oracle_text ?? c.oracle_text ?? "";
}

function commanderBackName(c: CommanderCard): string {
  return c.card_faces?.[1]?.name ?? "";
}

function commanderBackOracleText(c: CommanderCard): string {
  return c.card_faces?.[1]?.oracle_text ?? "";
}

function commanderColorIdentity(c: CommanderCard): string[] {
  if (Array.isArray(c.color_identity)) {
    return [...c.color_identity];
  }
  const colors = c.colors ?? c.card_faces?.[0]?.colors ?? [];
  return Array.isArray(colors) ? colors : [];
}

function formatColorIdentity(colors: string[]): string {
  if (!colors.length) return "Colorless";
  const order = ["W", "U", "B", "R", "G"];
  return [...colors].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join("");
}

function orderedColors(colors: string[]): string[] {
  const order = ["W", "U", "B", "R", "G"];
  return [...colors].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function commanderColorSymbolUrl(color: string): string | null {
  // Files live in `frontend/MARFrontend/public` and are served from the site root.
  const map: Record<string, string> = {
    W: "white",
    U: "blue",
    B: "black",
    R: "red",
    G: "green",
    C: "colorless",
  };
  const family = map[color];
  return family ? `/${family}-symbol.png` : null;
}

function isFlippableNonAdventure(c: CommanderCard): boolean {
  if (c.layout === "adventure") return false;
  const front = c.card_faces?.[0]?.image_uris?.normal;
  const back = c.card_faces?.[1]?.image_uris?.normal;
  return Boolean(front && back);
}

export default function RandomizerPage() {
  const [cmc, setCmc] = useState<string>("");
  const [power, setPower] = useState<string>("");
  const [toughness, setToughness] = useState<string>("");
  const [numberCommanders, setNumberCommanders] = useState<number>(1);
  const [colors, setColors] = useState<string[]>([]);
  const [includingColors, setIncludingColors] = useState<"exactly" | "including">("exactly");

  const [result, setResult] = useState<CommanderCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedById, setFlippedById] = useState<Record<string, boolean>>({});

  const toggleColor = (color: string) => {
    setColors((prev) => {
      // Colorless is mutually exclusive with the colored mana symbols.
      if (color === "C") {
        return prev.includes("C") ? [] : ["C"];
      }

      const withoutColorless = prev.filter((c) => c !== "C");
      const toggled = withoutColorless.includes(color)
        ? withoutColorless.filter((c) => c !== color)
        : [...withoutColorless, color];
      return toggled;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const body: RandomCommandersBody = {
        numberCommanders,
        includingColors,
      };
      const rawCmc = cmc === "" ? undefined : parseInt(cmc, 10);
      const rawPower = power === "" ? undefined : parseInt(power, 10);
      const rawToughness = toughness === "" ? undefined : parseInt(toughness, 10);
      if (rawCmc !== undefined && !Number.isNaN(rawCmc)) body.cmc = Math.min(16, Math.max(0, rawCmc));
      if (rawPower !== undefined && !Number.isNaN(rawPower)) body.power = Math.min(20, Math.max(0, rawPower));
      if (rawToughness !== undefined && !Number.isNaN(rawToughness)) body.toughness = Math.min(20, Math.max(0, rawToughness));
      if (colors.length) body.colors = colors;

      const data = await commanders.random(body);
      setResult(data.commanders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get commanders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="main-content random-commander-page">
        <h1 className="random-commander-title">Random Commander</h1>
        {error && <p className="auth-error random-commander-error">{error}</p>}

        <form id="commanderForm" className="commander-form" onSubmit={handleSubmit}>
          <div className="commander-form-col commander-form-col--stats">
            <label htmlFor="cmc">Mana value</label>
            <input
              type="number"
              id="cmc"
              name="cmc"
              placeholder="Any"
              min={0}
              max={16}
              step={1}
              value={cmc}
              onChange={(e) => setCmc(e.target.value)}
              className="input commander-input"
            />
            <label htmlFor="power">Power</label>
            <input
              type="number"
              id="power"
              name="power"
              placeholder="Any"
              min={0}
              max={20}
              step={1}
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="input commander-input"
            />
            <label htmlFor="toughness">Toughness</label>
            <input
              type="number"
              id="toughness"
              name="toughness"
              placeholder="Any"
              min={0}
              max={20}
              step={1}
              value={toughness}
              onChange={(e) => setToughness(e.target.value)}
              className="input commander-input"
            />
          </div>

          <div className="commander-form-col commander-form-col--colors">
            <label htmlFor="includingColors">Mode</label>
            <select
              id="includingColors"
              name="includingColors"
              value={includingColors}
              onChange={(e) => setIncludingColors(e.target.value as "exactly" | "including")}
              className="input commander-input commander-form-mode-select"
            >
              <option value="exactly">Exact color identity</option>
              <option value="including">Identity includes these colors</option>
            </select>
            <span className="commander-form-field-label" id="colors-label">
              Color identity
            </span>
            <div
              className="color-filter color-filter--pentagon"
              role="group"
              aria-labelledby="colors-label"
            >
              {(
                [
                  ["W", "U"],
                  ["C", "B"],
                  ["G", "R"],
                ] as const
              ).map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={
                    "color-filter-row " +
                    (rowIndex === 0
                      ? "color-filter-row--top"
                      : rowIndex === 1
                        ? "color-filter-row--middle"
                        : "color-filter-row--bottom")
                  }
                >
                  {row.map((color) => (
                    <label
                      key={color}
                      className={`color-pip color-${color.toLowerCase()}`}
                      title={
                        color === "W"
                          ? "White"
                          : color === "U"
                            ? "Blue"
                            : color === "B"
                              ? "Black"
                              : color === "R"
                                ? "Red"
                                : color === "G"
                                  ? "Green"
                                  : "Colorless"
                      }
                    >
                      <input
                        type="checkbox"
                        name="colors"
                        value={color}
                        checked={colors.includes(color)}
                        onChange={() => toggleColor(color)}
                      />
                      {(() => {
                        const src = commanderColorSymbolUrl(color);
                        if (!src) return color;
                        return (
                          <img
                            src={src}
                            alt=""
                            aria-hidden="true"
                            className="color-filter-icon"
                            loading="lazy"
                          />
                        );
                      })()}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="commander-form-col commander-form-col--actions">
            <label htmlFor="numberCommanders">Number of cards</label>
            <select
              id="numberCommanders"
              name="numberCommanders"
              value={numberCommanders}
              onChange={(e) => setNumberCommanders(parseInt(e.target.value, 10))}
              className="input commander-input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-block commander-submit" disabled={loading}>
              {loading ? "Loading…" : "Get commanders"}
            </button>
          </div>
        </form>

        {result !== null && (
          <div className="commander-results commander-results--below">
            {result.length === 0 ? (
              <p className="commander-no-results">No commanders match the criteria.</p>
            ) : (
              <div className="commander-image-list">
                {result.map((c) => {
                  const frontSrc = commanderImageUrl(c);
                  const backSrc = commanderBackImageUrl(c);
                  const name = commanderFrontName(c);
                  const oracleText = commanderFrontOracleText(c);
                  const backName = commanderBackName(c);
                  const backOracle = commanderBackOracleText(c);
                  const colors = commanderColorIdentity(c);
                  const ordered = orderedColors(colors);
                  const canFlip = isFlippableNonAdventure(c);
                  const isBack = Boolean(flippedById[c.id]);
                  const hoverSrc = canFlip ? (isBack ? backSrc : frontSrc) : frontSrc;

                  const displayOracle =
                    canFlip && (oracleText || backOracle)
                      ? `${name}${oracleText ? `\n${oracleText}` : ""}${
                          backName || backOracle
                            ? `\n\n${backName || "Back"}${backOracle ? `\n${backOracle}` : ""}`
                            : ""
                        }`
                      : oracleText;

                  return (
                    <div key={c.id} className="commander-result-card">
                      <img
                        className="commander-hover-preview"
                        src={hoverSrc}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                      />
                      <div className="commander-result-pips" aria-label="Color identity">
                        {ordered.length ? (
                          ordered.map((sym) => {
                            const symbolSrc = commanderColorSymbolUrl(sym);
                            if (!symbolSrc) return null;
                            return (
                              <span
                                key={sym}
                                className={`color-identity-pip color-${sym.toLowerCase()}`}
                                title={sym}
                              >
                                <img
                                  src={symbolSrc}
                                  alt=""
                                  aria-hidden="true"
                                  className="color-identity-symbol"
                                  loading="lazy"
                                />
                              </span>
                            );
                          })
                        ) : (
                          <span className="commander-result-colorless" title="Colorless">
                            <img
                              src="/colorless-symbol.png"
                              alt=""
                              aria-hidden="true"
                              className="color-identity-symbol"
                              loading="lazy"
                            />
                          </span>
                        )}
                      </div>
                      <div className="commander-result-image-wrap">
                        {canFlip ? (
                          <>
                            <div className={"commander-flip" + (isBack ? " commander-flip--back" : "")}>
                              <img
                                src={frontSrc}
                                alt={name}
                                className="commander-card-image commander-card-image--face commander-card-image--front"
                                loading="lazy"
                              />
                              <img
                                src={backSrc}
                                alt={backName || "Back face"}
                                className="commander-card-image commander-card-image--face commander-card-image--back"
                                loading="lazy"
                              />
                            </div>
                            <button
                              type="button"
                              className="commander-flip-btn"
                              onClick={() =>
                                setFlippedById((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                              }
                              aria-label={isBack ? "Show front face" : "Show back face"}
                              title={isBack ? "Show front face" : "Show back face"}
                            >
                              <svg
                                className="commander-flip-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 4v6h6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M20 20v-6h-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M20 9a8 8 0 0 0-14-3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M4 15a8 8 0 0 0 14 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <img
                            src={frontSrc}
                            alt={name}
                            className="commander-card-image"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="commander-result-name">{name}</div>
                      {displayOracle ? (
                        <div className="commander-result-oracle">{displayOracle}</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

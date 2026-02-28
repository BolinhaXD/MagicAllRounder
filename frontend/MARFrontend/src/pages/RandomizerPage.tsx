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

  const toggleColor = (color: string) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
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
        <div className="random-commander-row">
          <form id="commanderForm" className="commander-form" onSubmit={handleSubmit}>
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
            className="input"
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
            className="input"
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
            className="input"
          />

          <label htmlFor="numberCommanders">Number of commanders</label>
          <select
            id="numberCommanders"
            name="numberCommanders"
            value={numberCommanders}
            onChange={(e) => setNumberCommanders(parseInt(e.target.value, 10))}
            className="input"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
          </select>

          <label>Colors</label>
          <div className="color-filter" role="group" aria-label="Commander colors">
            {(["W", "U", "B", "R", "G"] as const).map((color) => (
              <label
                key={color}
                className={`color-pip color-${color.toLowerCase()}`}
                title={color === "W" ? "White" : color === "U" ? "Blue" : color === "B" ? "Black" : color === "R" ? "Red" : "Green"}
              >
                <input
                  type="checkbox"
                  name="colors"
                  value={color}
                  checked={colors.includes(color)}
                  onChange={() => toggleColor(color)}
                />
                {color}
              </label>
            ))}
          </div>

          <label htmlFor="includingColors">Color mode</label>
          <select
            id="includingColors"
            name="includingColors"
            value={includingColors}
            onChange={(e) => setIncludingColors(e.target.value as "exactly" | "including")}
            className="input"
          >
            <option value="exactly">Exactly these colors</option>
            <option value="including">Including these colors</option>
          </select>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Loading…" : "Get commanders"}
          </button>
          </form>

          {result !== null && (
            <div className="commander-results">
            {result.length === 0 ? (
              <p className="commander-no-results">No commanders match the criteria.</p>
            ) : (
              <div className="commander-image-list">
                {result.map((c) => {
                  const src = commanderImageUrl(c);
                  return (
                    <img
                      key={c.id}
                      src={src}
                      alt={c.name}
                      className="commander-card-image"
                    />
                  );
                })}
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

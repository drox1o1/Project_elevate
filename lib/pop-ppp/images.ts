import fs from "node:fs";
import path from "node:path";

/**
 * Key art lookup for Pop PPP indices.
 *
 * Server-only. Drop image files into `public/pop-ppp/` and every surface that
 * can show key art picks them up — cards, cold opens, the rail, the share
 * export. Nothing to register, and no half-configured state where an index
 * points at a file that does not exist.
 *
 * Files must live under `public/`. Next serves that directory and only that
 * directory; an image sitting in `components/` is never reachable by URL, so
 * `npm run pop-ppp:images` exists to move them across and rename them to their
 * slugs in one step.
 *
 * When a slug has no file, callers fall back to the generative artwork drawn
 * from the index's own series, so the section is complete either way.
 *
 * Do not import this from a client component: it reads the filesystem. Pages
 * resolve the path on the server and pass the resulting string down.
 */

const DIR = path.join(process.cwd(), "public", "pop-ppp");

/** Preference order — first match wins, so a .webp beats a .png of the same slug. */
const EXTENSIONS = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

/**
 * Filenames as they arrive from the design side, mapped to index slugs.
 *
 * Keys are compared after stripping case, spaces, dashes and underscores, so
 * "raju ki mummy.jpg", "Raju-Ki-Mummy.JPG" and "rajukimummy.jpeg" all resolve.
 * Renaming source files by hand is exactly the kind of step that gets skipped
 * once and then silently breaks a card.
 */
export const IMAGE_ALIASES: Record<string, string> = {
  sanjubaba: "sanju-baba-50-tola",
  sanjubaba50tola: "sanju-baba-50-tola",
  rajukimummy: "raju-ki-mummy-bhindi",
  rajukimummybhindi: "raju-ki-mummy-bhindi",
  bhindi: "raju-ki-mummy-bhindi",
  moneyball: "moneyball-player-value",
  quarterpoundcheese: "royale-with-cheese",
  quarterpounderwithcheese: "royale-with-cheese",
  royalewithcheese: "royale-with-cheese",
  "5dollarshake": "vincent-vega-five-dollar-shake",
  fivedollarshake: "vincent-vega-five-dollar-shake",
  vincentvega: "vincent-vega-five-dollar-shake",
  meth: "walter-white-purity-premium",
  walterwhite: "walter-white-purity-premium",
  puritypremium: "walter-white-purity-premium",
};

/** Lowercase and strip everything that varies between naming habits. */
export function normaliseKey(name: string): string {
  return name.toLowerCase().replace(/[\s._-]+/g, "");
}

/** Resolve a bare filename (no extension) to an index slug, if it maps to one. */
export function slugForFilename(basename: string): string | null {
  const key = normaliseKey(basename);
  return IMAGE_ALIASES[key] ?? null;
}

function buildMap(): Map<string, string> {
  const map = new Map<string, string>();
  let entries: string[];
  try {
    entries = fs.readdirSync(DIR);
  } catch {
    // No directory yet. Every index falls back to generative artwork.
    return map;
  }

  // Sorted so extension preference resolves deterministically.
  const files = entries
    .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort(
      (a, b) =>
        EXTENSIONS.indexOf(path.extname(a).toLowerCase()) -
        EXTENSIONS.indexOf(path.extname(b).toLowerCase())
    );

  for (const file of files) {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const slug = slugForFilename(base) ?? base;
    if (!map.has(slug)) map.set(slug, `/pop-ppp/${encodeURIComponent(file)}`);
  }
  return map;
}

// Built once at module load. Pages are statically generated, so a file added
// after a build lands on the next one.
const IMAGES = buildMap();

/** Public URL for an index's key art, or null when there is none. */
export function imageFor(slug: string): string | null {
  return IMAGES.get(slug) ?? null;
}

export function hasImages(): boolean {
  return IMAGES.size > 0;
}

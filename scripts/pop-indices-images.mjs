#!/usr/bin/env node
/**
 * Move Pop Indices key art into place.
 *
 * Next serves `public/` and nothing else, so an image sitting in
 * `components/pop-indices/` is never reachable by URL. This copies images from a
 * source directory into `public/pop-indices/`, renaming each one to the slug of
 * the index it belongs to so the runtime lookup finds it.
 *
 *   node scripts/pop-indices-images.mjs [sourceDir]
 *
 * Default source is `components/pop-indices`. Files whose names do not map to a
 * known index are reported and skipped rather than copied under a guessed
 * name — a mislabelled card is worse than a missing one.
 */

import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

// Kept in step with IMAGE_ALIASES in lib/pop-indices/images.ts.
const ALIASES = {
  sanjubaba: "sanju-baba",
  sanjubaba50tola: "sanju-baba",
  rajukimummy: "rajus-mummy",
  rajukimummybhindi: "rajus-mummy",
  bhindi: "rajus-mummy",
  moneyball: "moneyball",
  quarterpoundcheese: "royale-with-cheese",
  quarterpounderwithcheese: "royale-with-cheese",
  royalewithcheese: "royale-with-cheese",
  "5dollarshake": "five-dollar-shake",
  fivedollarshake: "five-dollar-shake",
  vincentvega: "five-dollar-shake",
  rocketsingh: "rocket-singh",
  rocketsinghpc: "rocket-singh",
  khoslakaghosla: "khosla-plot",
  khoslaplot: "khosla-plot",
  forrestgump: "fruit-company",
  fruitcompany: "fruit-company",
  apple: "fruit-company",
  meth: "blue-meth",
  walterwhite: "blue-meth",
  puritypremium: "blue-meth",
  // Previous slugs. Kept so a file named the old way still resolves rather
  // than silently falling back to generative artwork.
  vincentvegafivedollarshake: "five-dollar-shake",
  walterwhitepuritypremium: "blue-meth",
  moneyballplayervalue: "moneyball",
};

const SLUGS = new Set(Object.values(ALIASES));

const normalise = (s) => s.toLowerCase().replace(/[\s._-]+/g, "");

/**
 * Real format from the file's magic bytes.
 *
 * Extensions lie — an export pipeline can hand you AVIF bytes named `.jpeg`,
 * which some browsers refuse to decode because the server labels it
 * `image/jpeg`. Writing the destination with the sniffed extension makes the
 * served Content-Type match the actual bytes.
 */
function sniff(buf) {
  if (buf.length >= 12) {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
    if (buf.subarray(4, 12).toString("latin1") === "ftypavif") return ".avif";
    if (buf.subarray(0, 8).toString("latin1") === "\x89PNG\r\n\x1a\n") return ".png";
    if (
      buf.subarray(0, 4).toString("latin1") === "RIFF" &&
      buf.subarray(8, 12).toString("latin1") === "WEBP"
    )
      return ".webp";
  }
  return null;
}

const sourceDir = path.resolve(process.argv[2] ?? "components/pop-indices");
const targetDir = path.resolve("public/pop-indices");

if (!fs.existsSync(sourceDir)) {
  console.error(`No such directory: ${sourceDir}`);
  process.exit(1);
}

const found = fs
  .readdirSync(sourceDir)
  .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()));

if (found.length === 0) {
  console.log(`No images found in ${sourceDir}`);
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

let copied = 0;
const skipped = [];
const written = new Map(); // slug -> destination filename

for (const file of found) {
  const srcPath = path.join(sourceDir, file);
  const declared = path.extname(file).toLowerCase();
  const base = path.basename(file, path.extname(file));
  const key = normalise(base);
  const slug = ALIASES[key] ?? (SLUGS.has(base) ? base : null);

  if (!slug) {
    skipped.push(file);
    continue;
  }

  const buf = fs.readFileSync(srcPath);
  const actual = sniff(buf) ?? declared;
  const mislabelled = actual !== declared && !(actual === ".jpg" && declared === ".jpeg");

  // One file per index. If two sources map to the same slug, keep the one
  // whose format we prefer rather than letting copy order decide.
  const existing = written.get(slug);
  if (existing) {
    const rank = (e) => EXTENSIONS.indexOf(e);
    if (rank(actual) >= rank(path.extname(existing))) {
      console.log(`  ${file}  ->  skipped, ${existing} already covers ${slug}`);
      continue;
    }
    fs.rmSync(path.join(targetDir, existing), { force: true });
  }

  const destName = `${slug}${actual}`;
  fs.writeFileSync(path.join(targetDir, destName), buf);
  written.set(slug, destName);
  console.log(
    `  ${file}  ->  public/pop-indices/${destName}` +
      (mislabelled ? `   (was named ${declared}, actually ${actual})` : "")
  );
  copied++;
}

console.log(`\n${copied} image${copied === 1 ? "" : "s"} in place.`);

if (skipped.length) {
  console.log(
    `\nSkipped (no matching index — add an alias in lib/pop-indices/images.ts):`
  );
  for (const f of skipped) console.log(`  ${f}`);
}

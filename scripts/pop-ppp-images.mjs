#!/usr/bin/env node
/**
 * Move Pop PPP key art into place.
 *
 * Next serves `public/` and nothing else, so an image sitting in
 * `components/pop-ppp/` is never reachable by URL. This copies images from a
 * source directory into `public/pop-ppp/`, renaming each one to the slug of
 * the index it belongs to so the runtime lookup finds it.
 *
 *   node scripts/pop-ppp-images.mjs [sourceDir]
 *
 * Default source is `components/pop-ppp`. Files whose names do not map to a
 * known index are reported and skipped rather than copied under a guessed
 * name — a mislabelled card is worse than a missing one.
 */

import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

// Kept in step with IMAGE_ALIASES in lib/pop-ppp/images.ts.
const ALIASES = {
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

const SLUGS = new Set(Object.values(ALIASES));

const normalise = (s) => s.toLowerCase().replace(/[\s._-]+/g, "");

const sourceDir = path.resolve(process.argv[2] ?? "components/pop-ppp");
const targetDir = path.resolve("public/pop-ppp");

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

for (const file of found) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, path.extname(file));
  const key = normalise(base);
  const slug = ALIASES[key] ?? (SLUGS.has(base) ? base : null);

  if (!slug) {
    skipped.push(file);
    continue;
  }

  const dest = path.join(targetDir, `${slug}${ext}`);
  fs.copyFileSync(path.join(sourceDir, file), dest);
  console.log(`  ${file}  ->  public/pop-ppp/${slug}${ext}`);
  copied++;
}

console.log(`\n${copied} image${copied === 1 ? "" : "s"} in place.`);

if (skipped.length) {
  console.log(
    `\nSkipped (no matching index — add an alias in lib/pop-ppp/images.ts):`
  );
  for (const f of skipped) console.log(`  ${f}`);
}

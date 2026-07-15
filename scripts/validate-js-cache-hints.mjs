import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkedExtensions = new Set([".html", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"]);
const skipDirs = new Set([".git", ".next", ".vercel", "node_modules", ".venv", ".venv-pdf", "neon-studio-exporter"]);
const localJsAssetPattern =
  /(?:src|href)=["'](\/(?!_next\/)[^"']+?\.js)(\?[^"']*)?["']|["'`](\/(?!_next\/)[^"'`]+?\.js)(\?[^"'`]*)?["'`]/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const errors = [];
const files = await walk(root);

for (const file of files) {
  const text = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  localJsAssetPattern.lastIndex = 0;

  for (const match of text.matchAll(localJsAssetPattern)) {
    const asset = match[1] ?? match[3];
    const query = match[2] ?? match[4] ?? "";

    if (!query.includes("?v=") && !query.includes("&v=")) {
      errors.push(`${relative}: ${asset} is missing ?v=[version increment]`);
      continue;
    }

    if (!/[?&]v=\d+/.test(query)) {
      errors.push(`${relative}: ${asset}${query} must use numeric ?v=[version increment]`);
    }
  }
}

if (errors.length > 0) {
  throw new Error(`JavaScript cache-hint validation failed:\n- ${errors.join("\n- ")}`);
}

console.log("JavaScript cache-hint validation passed.");

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { minify } from "terser";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const sourceExtensions = new Set([".js", ".cjs", ".mjs"]);
const skipDirs = new Set([".git", ".next", ".vercel", "node_modules", ".venv", ".venv-pdf", "neon-studio-exporter"]);

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

    if (!entry.isFile()) continue;
    if (entry.name.endsWith(".min.js")) continue;
    if (!sourceExtensions.has(path.extname(entry.name))) continue;
    files.push(fullPath);
  }

  return files;
}

function minifiedPathFor(sourcePath) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}.min.js`);
}

async function minifyFile(sourcePath) {
  const source = await readFile(sourcePath, "utf8");
  const result = await minify(source, {
    compress: true,
    mangle: true,
    module: path.extname(sourcePath) === ".mjs",
    format: {
      comments: false,
    },
  });

  if (!result.code) {
    throw new Error(`Terser produced empty output for ${path.relative(root, sourcePath)}`);
  }

  const outputPath = minifiedPathFor(sourcePath);
  const banner = `// Generated from ${path.relative(path.dirname(outputPath), sourcePath)}. Do not edit directly.\n`;
  return { outputPath, code: `${banner}${result.code}\n` };
}

const sources = await walk(root);
const stale = [];

for (const sourcePath of sources) {
  const { outputPath, code } = await minifyFile(sourcePath);

  if (checkOnly) {
    let current = "";
    try {
      current = await readFile(outputPath, "utf8");
    } catch {
      stale.push(path.relative(root, outputPath));
      continue;
    }

    if (current !== code) {
      stale.push(path.relative(root, outputPath));
    }
    continue;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, code);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

if (checkOnly && stale.length > 0) {
  throw new Error(`Outdated minified JavaScript files:\n- ${stale.join("\n- ")}`);
}

if (checkOnly) {
  console.log(`Checked ${sources.length} JavaScript files; minified artifacts are current.`);
}

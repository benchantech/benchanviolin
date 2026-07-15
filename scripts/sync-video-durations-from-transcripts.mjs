import fs from "node:fs";
import path from "node:path";
import { Client } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const transcriptRoot = process.argv[2] || path.join(process.env.HOME, "Desktop", "BenChanTranscripts");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!fs.existsSync(transcriptRoot)) throw new Error(`Transcript root not found: ${transcriptRoot}`);

function listJsonFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(full);
  }
  return files.sort();
}

function parseTimestampToken(token) {
  if (!/^\d{6}$/.test(token)) throw new Error(`Invalid timestamp token: ${token}`);
  const hours = Number(token.slice(0, 2));
  const minutes = Number(token.slice(2, 4));
  const seconds = Number(token.slice(4, 6));
  if (minutes >= 60 || seconds >= 60) throw new Error(`Invalid HHMMSS timestamp token: ${token}`);
  return hours * 3600 + minutes * 60 + seconds;
}

const durations = new Map();
for (const file of listJsonFiles(transcriptRoot)) {
  const match = path.basename(file).match(/^(.+)__chunk_\d+__\d{6}-(\d{6})\.json$/);
  if (!match) continue;
  durations.set(match[1], Math.max(durations.get(match[1]) ?? 0, parseTimestampToken(match[2])));
}

const client = new Client(databaseUrl);
await client.connect();

let updated = 0;
try {
  await client.query("begin");
  for (const [youtubeId, duration] of durations) {
    const result = await client.query(
      `
        update videos
        set duration_seconds = $2
        where youtube_video_id = $1 and duration_seconds is distinct from $2
      `,
      [youtubeId, duration],
    );
    updated += result.rowCount;
  }
  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

console.log(`transcript videos checked: ${durations.size}`);
console.log(`video durations updated: ${updated}`);

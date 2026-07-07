import path from "node:path";
import { parseCsvFile, required } from "./csv.mjs";

const seedPath = path.join(process.cwd(), "data", "seed", "tan_dun_reviewed_segments.csv");
const rows = parseCsvFile(seedPath);
const validTags = new Set([
  "bartok-pizzicato",
  "ricochet",
  "bow-drop",
  "bow-relaxation",
  "arm-weight",
  "string-crossing",
  "orchestral-balance",
  "trills",
  "accent",
  "sforzando-piano",
]);

const segmentKeys = new Set();
const errors = [];

rows.forEach((row, index) => {
  const rowNumber = index + 2;
  try {
    required(row.video_id, "video_id", rowNumber);
    required(row.segment_key, "segment_key", rowNumber);
    required(row.segment_title, "segment_title", rowNumber);
    required(row.start_seconds, "start_seconds", rowNumber);
    required(row.end_seconds, "end_seconds", rowNumber);
    required(row.tag_slugs, "tag_slugs", rowNumber);
    required(row.use_when, "use_when", rowNumber);
    required(row.teaching_summary, "teaching_summary", rowNumber);

    const start = Number(row.start_seconds);
    const end = Number(row.end_seconds);
    if (!Number.isInteger(start) || start < 0) throw new Error(`Row ${rowNumber}: invalid start_seconds`);
    if (!Number.isInteger(end) || end <= start) throw new Error(`Row ${rowNumber}: invalid end_seconds`);
    if (end > 801) throw new Error(`Row ${rowNumber}: segment exceeds known video duration`);
    if (row.start_url !== `https://www.youtube.com/watch?v=${row.video_id}&t=${start}s`) {
      throw new Error(`Row ${rowNumber}: start_url does not match video_id/start_seconds`);
    }
    if (row.segment_key !== `${row.video_id}:${start}:${end}`) {
      throw new Error(`Row ${rowNumber}: segment_key does not match video_id/start/end`);
    }
    if (segmentKeys.has(row.segment_key)) throw new Error(`Row ${rowNumber}: duplicate segment_key`);
    segmentKeys.add(row.segment_key);
    if (row.review_status !== "manual_reviewed") throw new Error(`Row ${rowNumber}: row is not manual_reviewed`);

    const unknown = row.tag_slugs.split("|").filter((slug) => !validTags.has(slug));
    if (unknown.length > 0) throw new Error(`Row ${rowNumber}: unknown tag slugs ${unknown.join(", ")}`);
  } catch (error) {
    errors.push(error.message);
  }
});

if (rows.length !== 17) errors.push(`Expected 17 reviewed segments, found ${rows.length}`);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Tan Dun seed validation passed");
console.log(`segments: ${rows.length}`);
console.log(`public manual-reviewed rows: ${rows.filter((row) => row.review_status === "manual_reviewed").length}`);

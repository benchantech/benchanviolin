import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { parseCsvFile } from "./csv.mjs";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to import Tan Dun segments.");
}

const sql = neon(databaseUrl);
const seedPath = path.join(process.cwd(), "data", "seed", "tan_dun_reviewed_segments.csv");
const rows = parseCsvFile(seedPath);

let inserted = 0;
let updated = 0;
let assignments = 0;
const unknownTagSlugs = new Set();
const invalidRows = [];
const duplicateKeys = new Set();
const seenKeys = new Set();

for (const [index, row] of rows.entries()) {
  const rowNumber = index + 2;
  const start = Number(row.start_seconds);
  const end = Number(row.end_seconds);
  const isPublic = row.review_status === "manual_reviewed";

  if (seenKeys.has(row.segment_key)) duplicateKeys.add(row.segment_key);
  seenKeys.add(row.segment_key);
  if (!row.segment_title || !row.use_when || !row.teaching_summary || !Number.isInteger(start) || !Number.isInteger(end) || end <= start) {
    invalidRows.push(rowNumber);
    continue;
  }

  const [video] = await sql.query("select id, duration_seconds from videos where youtube_video_id = $1", [row.video_id]);
  if (!video || end > video.duration_seconds) {
    invalidRows.push(rowNumber);
    continue;
  }

  const result = await sql.query(
    `
      insert into segments (
        video_id, start_seconds, end_seconds, segment_key, segment_title, timestamp_label, start_url,
        use_when, teaching_summary, problem_statement, common_failure_mode, suggested_experiment,
        reflection_prompt, review_status, is_public, quality_score, source_type, transcript_source_file, notes
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      on conflict (segment_key) do update set
        start_seconds = excluded.start_seconds,
        end_seconds = excluded.end_seconds,
        segment_title = excluded.segment_title,
        timestamp_label = excluded.timestamp_label,
        start_url = excluded.start_url,
        use_when = excluded.use_when,
        teaching_summary = excluded.teaching_summary,
        problem_statement = excluded.problem_statement,
        common_failure_mode = excluded.common_failure_mode,
        suggested_experiment = excluded.suggested_experiment,
        reflection_prompt = excluded.reflection_prompt,
        review_status = excluded.review_status,
        is_public = excluded.is_public,
        quality_score = excluded.quality_score,
        source_type = excluded.source_type,
        transcript_source_file = excluded.transcript_source_file,
        notes = excluded.notes
      returning id, (xmax = 0) as inserted
    `,
    [
      video.id,
      start,
      end,
      row.segment_key,
      row.segment_title,
      row.timestamp,
      row.start_url,
      row.use_when,
      row.teaching_summary,
      row.problem_statement,
      row.common_failure_mode,
      row.suggested_experiment,
      row.reflection_prompt,
      row.review_status,
      isPublic,
      Number(row.quality_score),
      row.source_type,
      row.transcript_source_file,
      row.notes,
    ],
  );

  const segment = result[0];
  if (segment.inserted) inserted += 1;
  else updated += 1;

  await sql.query("delete from segment_tags where segment_id = $1", [segment.id]);
  const slugs = row.tag_slugs.split("|").filter(Boolean);
  for (const [tagIndex, slug] of slugs.entries()) {
    const [tag] = await sql.query("select id from tags where slug = $1", [slug]);
    if (!tag) {
      unknownTagSlugs.add(slug);
      continue;
    }
    await sql.query(
      `
        insert into segment_tags (segment_id, tag_id, relevance, is_primary, assigned_by)
        values ($1, $2, $3, $4, 'manual_review')
        on conflict (segment_id, tag_id) do update set
          relevance = excluded.relevance,
          is_primary = excluded.is_primary,
          assigned_by = excluded.assigned_by
      `,
      [segment.id, tag.id, tagIndex === 0 ? 100 : 80, tagIndex === 0],
    );
    assignments += 1;
  }
}

const publicCount = await sql.query(
  "select count(*)::integer as count from segments where is_public = true and review_status = 'manual_reviewed'",
);

console.log("videos upserted: 1");
console.log(`segments inserted: ${inserted}`);
console.log(`segments updated: ${updated}`);
console.log(`tag assignments inserted: ${assignments}`);
console.log(`unknown tag slugs: ${Array.from(unknownTagSlugs).join(", ") || "none"}`);
console.log(`invalid rows: ${invalidRows.join(", ") || "none"}`);
console.log(`duplicate segment keys: ${Array.from(duplicateKeys).join(", ") || "none"}`);
console.log(`public segment count: ${publicCount[0].count}`);

if (unknownTagSlugs.size > 0 || invalidRows.length > 0 || duplicateKeys.size > 0) {
  process.exit(1);
}

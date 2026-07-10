import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const siteUrl = (process.env.SITE_URL || "https://benchanviolin.com").replace(/\/$/, "");
const outputPath = process.argv[2] || path.join("output", "txt", "library-search-urls.txt");
const sql = neon(connectionString);

function normalizeTerm(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function encodeQueryWithPlus(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

const rows = await sql`
  with public_segments as (
    select s.*
    from segments s
    join videos v on v.id = s.video_id
    where s.is_public = true and v.is_public = true
  ),
  raw_terms as (
    select t.label as term, 'tag_label' as source
    from tags t
    join tag_groups tg on tg.id = t.group_id
    where t.is_public = true and t.is_active = true and tg.is_public = true

    union all

    select replace(t.slug, '-', ' ') as term, 'tag_slug' as source
    from tags t
    join tag_groups tg on tg.id = t.group_id
    where t.is_public = true and t.is_active = true and tg.is_public = true

    union all

    select a.alias as term, 'tag_alias' as source
    from tag_aliases a
    join tags t on t.id = a.tag_id
    join tag_groups tg on tg.id = t.group_id
    where a.is_public = true and t.is_public = true and t.is_active = true and tg.is_public = true

    union all

    select segment_title as term, 'segment_title' as source
    from public_segments

    union all

    select teaching_summary as term, 'teaching_summary' as source
    from public_segments

    union all

    select clue as term, 'contextual_clue' as source
    from public_segments
    cross join unnest(contextual_clues) clue
  )
  select term, array_agg(distinct source order by source) as sources
  from raw_terms
  where nullif(trim(term), '') is not null
  group by term
  order by lower(term), term;
`;

const seen = new Map();

for (const row of rows) {
  const term = normalizeTerm(row.term);
  if (!term) continue;

  const existing = seen.get(term);
  const sources = Array.isArray(row.sources) ? row.sources : [];
  if (existing) {
    for (const source of sources) existing.sources.add(source);
  } else {
    seen.set(term, { term, sources: new Set(sources) });
  }
}

const lines = [...seen.values()].map(({ term, sources }) => {
  const url = `${siteUrl}/q=${encodeQueryWithPlus(term)}`;
  return `${url}\t${term}\t${[...sources].join(",")}`;
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(`Exported ${lines.length} library search URLs to ${outputPath}`);

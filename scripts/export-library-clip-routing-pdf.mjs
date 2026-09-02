import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

const siteUrl = (process.env.SITE_URL || "https://benchanviolin.com").replace(/\/$/, "");
const outputPath = process.argv[2] || path.join("output", "pdf", "library-clip-routing-export.pdf");
const sql = neon(databaseUrl);

function clean(value) {
  return String(value ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[…]/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTerm(value) {
  return clean(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9#+]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function encodeQuery(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function truncate(value, maxLength) {
  const text = clean(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function routeNote(row) {
  const routeLabel = clean(row.route_label);
  const routeSummary = clean(row.route_summary);
  const validation = clean(row.validation_status);
  const status = clean(row.review_status);

  if (routeLabel) {
    const qualifier = status === "manual_reviewed"
      ? "reviewed clip"
      : validation === "transcript_aligned"
        ? "transcript-aligned candidate"
        : "candidate clip";
    return `Recommend as a ${qualifier} for ${routeLabel.toLowerCase()} after the current practice question is clarified.`;
  }

  if (routeSummary) {
    return `Use after clarifying that the learner's issue matches this teaching context: ${truncate(routeSummary, 110)}`;
  }

  return "Recommend only after the current practice question is clarified and the clip context matches the learner's issue.";
}

function notWhen(row) {
  const route = normalizeTerm(`${row.route_label} ${row.route_summary} ${row.teaching_summary}`);
  if (route.includes("bow") || route.includes("tone") || route.includes("sound")) {
    return "the issue is mainly left-hand pitch, shifting, rhythm, or score reading";
  }
  if (route.includes("shift") || route.includes("position") || route.includes("intonation") || route.includes("finger")) {
    return "the issue is mainly rhythm, bow planning, sound color, or score reading";
  }
  if (route.includes("rhythm") || route.includes("beat") || route.includes("tempo")) {
    return "the issue is mainly tone production, shifting accuracy, or left-hand frame";
  }
  if (route.includes("double stop") || route.includes("chord") || route.includes("triple stop")) {
    return "the issue is mainly single-line rhythm, basic bow contact, or score reading";
  }
  return "the learner's problem is unrelated to the clip title, transcript clue, or teaching summary";
}

function resourceType(row) {
  const title = normalizeTerm(row.segment_title);
  const summary = normalizeTerm(row.teaching_summary);
  if (title.includes("demonstrat") || summary.includes("demonstrat") || summary.includes("show")) {
    return "direct answer / demonstration";
  }
  if (summary.includes("compare") || summary.includes("difference") || summary.includes("similar")) {
    return "direct answer / demonstration / useful comparison";
  }
  return "direct answer / demonstration / useful comparison";
}

function searchTermFor(row) {
  const candidates = [
    row.route_label,
    row.use_when,
    row.segment_title,
    row.contextual_clues?.[0],
    row.teaching_summary,
  ];

  for (const candidate of candidates) {
    const term = normalizeTerm(candidate);
    if (term.length >= 4) return term;
  }

  return normalizeTerm(row.youtube_video_id);
}

function makeEntry(row) {
  const searchTerm = searchTermFor(row);
  return {
    title: clean(row.segment_title) || clean(row.route_label) || `Clip ${row.youtube_video_id}`,
    url: `${siteUrl}/library?q=${encodeQuery(searchTerm)}`,
    useWhen: clean(row.use_when) || clean(row.problem_statement) || clean(row.teaching_summary),
    notWhen: notWhen(row),
    resourceType: resourceType(row),
    coachRoutingNote: routeNote(row),
  };
}

function pdfEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text, maxChars) {
  const words = clean(text)
    .split(" ")
    .filter(Boolean)
    .flatMap((word) => {
      if (word.length <= maxChars) return [word];
      const parts = [];
      for (let index = 0; index < word.length; index += maxChars) {
        parts.push(word.slice(index, index + maxChars));
      }
      return parts;
    });
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function createPdf(entries) {
  const width = 612;
  const height = 792;
  const margin = 54;
  const lineHeight = 13;
  const objects = [""]; // 1-indexed
  const pages = [];

  function addObject(body) {
    objects.push(body);
    return objects.length - 1;
  }

  const fontObject = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontObject = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  function pushPage(lines, links) {
    const content = [
      "BT",
      ...lines.map((line) => {
        const font = line.bold ? "F2" : "F1";
        return `/${font} ${line.size || 10} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${pdfEscape(line.text)}) Tj`;
      }),
      "ET",
    ].join("\n");
    const contentObject = addObject(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
    const annots = links.map((link) => {
      const uri = pdfEscape(link.url);
      return `<< /Type /Annot /Subtype /Link /Rect [${link.x1} ${link.y1} ${link.x2} ${link.y2}] /Border [0 0 0] /A << /S /URI /URI (${uri}) >> >>`;
    });
    const pageObject = addObject([
      "<< /Type /Page /Parent 0 0 R",
      `/MediaBox [0 0 ${width} ${height}]`,
      `/Resources << /Font << /F1 ${fontObject} 0 R /F2 ${boldFontObject} 0 R >> >>`,
      `/Contents ${contentObject} 0 R`,
      annots.length ? `/Annots [${annots.join(" ")}]` : "",
      ">>",
    ].filter(Boolean).join("\n"));
    pages.push({ pageObject, placeholder: `${pageObject} 0 obj` });
  }

  let lines = [];
  let links = [];
  let y = height - margin;

  function ensure(neededLines) {
    if (y - neededLines * lineHeight < margin) {
      pushPage(lines, links);
      lines = [];
      links = [];
      y = height - margin;
    }
  }

  function textLine(text, { bold = false, size = 10, indent = 0 } = {}) {
    lines.push({ text, bold, size, x: margin + indent, y });
    y -= lineHeight;
  }

  textLine("Technique Library Clip Routing Export", { bold: true, size: 15 });
  textLine(`Generated ${new Date().toISOString().slice(0, 10)}. ${entries.length} clips. Each URL is clickable.`, { size: 9 });
  y -= 8;

  entries.forEach((entry, index) => {
    const fields = [
      ["Entry title", entry.title, true],
      ["URL", entry.url, false, entry.url],
      ["Use when", entry.useWhen],
      ["Not when", entry.notWhen],
      ["Resource type", entry.resourceType],
      ["Coach routing note", entry.coachRoutingNote],
    ];
    const needed = 2 + fields.flatMap(([, value]) => wrapText(value, 82)).length;
    ensure(needed);
    textLine(`${index + 1}. ${entry.title}`, { bold: true, size: 11 });

    for (const [label, value, labelBold, url] of fields) {
      const wrapped = url ? [`${label}:`, ...wrapText(value, 92)] : wrapText(`${label}: ${value}`, 92);
      wrapped.forEach((line, lineIndex) => {
        const x = margin + 12 + (url && lineIndex > 0 ? 18 : 0);
        lines.push({ text: line, bold: Boolean(labelBold && lineIndex === 0), size: 9, x, y });
        if (url && lineIndex > 0) {
          links.push({ url, x1: x, y1: y - 2, x2: Math.min(width - margin, x + line.length * 4.8), y2: y + 10 });
        }
        y -= lineHeight;
      });
    }
    y -= 8;
  });

  if (lines.length) pushPage(lines, links);

  const pagesObject = addObject(`<< /Type /Pages /Kids [${pages.map((page) => `${page.pageObject} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  for (const page of pages) {
    objects[page.pageObject] = objects[page.pageObject].replace("/Parent 0 0 R", `/Parent ${pagesObject} 0 R`);
  }
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

  const chunks = ["%PDF-1.7\n"];
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(chunks.join(""));
    chunks.push(`${index} 0 obj\n${objects[index]}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(chunks.join(""));
  chunks.push(`xref\n0 ${objects.length}\n0000000000 65535 f \n`);
  for (let index = 1; index < objects.length; index += 1) {
    chunks.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer\n<< /Size ${objects.length} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return Buffer.from(chunks.join(""), "utf8");
}

const rows = await sql`
  select
    s.id,
    s.segment_title,
    s.use_when,
    s.teaching_summary,
    s.problem_statement,
    s.review_status,
    s.validation_status,
    s.contextual_clues,
    s.start_url,
    s.start_seconds,
    s.route_match_score,
    v.title as video_title,
    v.youtube_video_id,
    tr.label as route_label,
    trn.summary as route_summary
  from segments s
  join videos v on v.id = s.video_id
  left join technical_routes tr on tr.route_id = s.route_id
  left join technical_route_nodes trn on trn.node_id = s.route_node_id
  where v.is_public = true
    and (v.duration_seconds = 0 or s.end_seconds <= v.duration_seconds)
  order by
    coalesce(tr.label, s.segment_title),
    v.youtube_video_id,
    s.start_seconds;
`;

const entries = rows.map(makeEntry);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, createPdf(entries));

console.log(`Exported ${entries.length} clip routing entries to ${outputPath}`);

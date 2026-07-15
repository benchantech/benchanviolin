import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { Client } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-local-env.mjs";

const require = createRequire(import.meta.url);
const {
  listTechnicalRouteDetails,
  routeTechnicalQuestion,
} = require("../lib/benchanviolin-deterministic-router.cjs");

loadLocalEnv();

const args = process.argv.slice(2);
const mode = args.includes("--export-candidates")
  ? "export"
  : args.includes("--import-cache")
    ? "import"
    : "rebuild";
const transcriptRootArg = args.find((arg) => !arg.startsWith("--"));
const transcriptRoot = transcriptRootArg || path.join(process.env.HOME, "Desktop", "BenChanTranscripts");
const databaseUrl = process.env.DATABASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.LIBRARY_REBUILD_MODEL || "gpt-5-mini";
const skipLlm = process.env.LIBRARY_REBUILD_SKIP_LLM === "1";
const cacheDir = path.join(process.cwd(), ".cache");
const llmCachePath = path.join(cacheDir, "route-candidate-llm-payloads.json");
const selectedCandidatesPath = path.join(cacheDir, "route-candidates-selected.json");
const candidateBatchDir = path.join(cacheDir, "route-candidate-batches");
const batchSize = Number(process.env.LIBRARY_REBUILD_BATCH_SIZE || 25);
const maxFiles = Number(process.env.LIBRARY_REBUILD_MAX_FILES || 0);

if (mode !== "export" && !databaseUrl) throw new Error("DATABASE_URL is required.");
if (mode === "rebuild" && !skipLlm && !openaiApiKey) {
  throw new Error("OPENAI_API_KEY is required for API LLM rebuilds. Use --export-candidates and --import-cache for session-batch enrichment.");
}
if (!fs.existsSync(transcriptRoot)) throw new Error(`Transcript root not found: ${transcriptRoot}`);

const routes = listTechnicalRouteDetails();
const routeById = new Map(routes.map((route) => [route.id, route]));
const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for", "from",
  "get", "gets", "getting", "how", "i", "im", "in", "into", "is", "it", "my", "of", "on", "or",
  "the", "this", "to", "too", "when", "why", "with", "you", "your", "that", "then", "what", "will",
]);

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9#+\s-]/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token && !stopWords.has(token) && token.length > 2);
}

function phraseIn(text, phrase) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedPhrase = normalize(phrase);
  return normalizedPhrase && normalizedText.includes(` ${normalizedPhrase} `);
}

function chunkStartFromFilename(file) {
  const match = path.basename(file).match(/__chunk_\d+__(\d{6})-\d{6}\.json$/);
  if (!match) throw new Error(`Cannot parse chunk offset: ${file}`);
  return Number(match[1]);
}

function secondsLabel(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function timestampLabel(start, end) {
  return `${secondsLabel(start)}-${secondsLabel(end)}`;
}

function truncateText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function candidateCacheKey(candidate) {
  return createHash("sha256")
    .update(JSON.stringify({
      youtubeId: candidate.youtubeId,
      startSeconds: candidate.startSeconds,
      endSeconds: candidate.endSeconds,
      routeId: candidate.route.id,
      branchOptionId: candidate.branchOptionId,
      evidenceText: candidate.evidenceText,
    }))
    .digest("hex");
}

function readJsonFile(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJsonFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function compactRoute(route) {
  return {
    id: route.id,
    label: route.label,
    domain: route.domain,
    summary: route.summary,
    firstAction: route.firstAction,
    verification: route.verification,
    stopCondition: route.stopCondition,
    searchTerms: route.searchTerms,
  };
}

function compactCandidate(candidate) {
  const branch = candidate.route.branch && candidate.branchOptionId
    ? candidate.route.branch.options.find((option) => option.id === candidate.branchOptionId)
    : null;
  return {
    key: candidateCacheKey(candidate),
    youtubeId: candidate.youtubeId,
    transcriptSourceFile: candidate.transcriptSourceFile,
    startSeconds: candidate.startSeconds,
    endSeconds: candidate.endSeconds,
    timestampLabel: timestampLabel(candidate.startSeconds, candidate.endSeconds),
    route: compactRoute(candidate.route),
    branch: branch
      ? {
          id: branch.id,
          label: branch.label,
          summary: branch.result?.summary ?? "",
          firstAction: branch.result?.firstAction ?? "",
        }
      : null,
    routeMatchScore: candidate.routeMatchScore,
    routeMatchReason: candidate.routeMatchReason,
    evidenceText: candidate.evidenceText,
  };
}

function writeCandidateBatches(candidates) {
  fs.rmSync(candidateBatchDir, { recursive: true, force: true });
  writeJsonFile(selectedCandidatesPath, candidates.map(compactCandidate));

  for (let index = 0; index < candidates.length; index += batchSize) {
    const batch = candidates.slice(index, index + batchSize).map(compactCandidate);
    const batchNumber = String(Math.floor(index / batchSize) + 1).padStart(3, "0");
    writeJsonFile(path.join(candidateBatchDir, `batch-${batchNumber}.json`), {
      batch: batchNumber,
      count: batch.length,
      candidates: batch,
    });
  }
}

function listJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

function routeKeywords(route) {
  return [
    route.label,
    route.summary,
    route.firstAction,
    ...route.searchTerms,
    ...route.exact,
    ...route.tokenGroups.flat().flat(),
  ];
}

const routeFeatures = new Map(routes.map((route) => [
  route.id,
  {
    keywordTokens: new Set(tokens(routeKeywords(route).join(" "))),
    exactAndSearchTerms: [...route.exact, ...route.searchTerms],
    branchOptions: route.branch
      ? route.branch.options.map((option) => ({
          id: option.id,
          tokens: new Set(tokens([option.label, option.result?.summary, option.result?.firstAction].join(" "))),
        }))
      : [],
  },
]));

function scoreRoute(route, text, normalizedText, textTokens, governed) {
  if (!normalizedText) return null;
  if (route.exclude.some((phrase) => phraseIn(normalizedText, phrase))) return null;

  let score = 0;
  const reasons = [];
  const features = routeFeatures.get(route.id);

  if (governed.kind !== "FALLBACK" && governed.route?.routeId === route.id) {
    score += governed.kind === "DIRECT" || governed.kind === "BRANCH" ? 650 : 450;
    reasons.push(`router:${governed.kind.toLowerCase()}`);
  }

  for (const phrase of features.exactAndSearchTerms) {
    if (phraseIn(normalizedText, phrase)) {
      score += 220;
      reasons.push(`phrase:${phrase}`);
    }
  }

  let overlap = 0;
  for (const token of features.keywordTokens) {
    if (textTokens.has(token)) overlap += 1;
  }
  score += overlap * 18;
  if (overlap) reasons.push(`token-overlap:${overlap}`);

  let branchOptionId = null;
  if (features.branchOptions.length) {
    let bestBranch = { id: null, score: 0 };
    for (const option of features.branchOptions) {
      let optionScore = 0;
      for (const token of option.tokens) {
        if (textTokens.has(token)) optionScore += 1;
      }
      if (optionScore > bestBranch.score) bestBranch = { id: option.id, score: optionScore };
    }
    if (bestBranch.id && bestBranch.score >= 2) {
      branchOptionId = bestBranch.id;
      score += bestBranch.score * 20;
      reasons.push(`branch:${bestBranch.id}`);
    }
  }

  if (score < 95) return null;
  return { score, reason: reasons.slice(0, 5).join("; "), branchOptionId };
}

function rootNodeId(route) {
  return route.id;
}

function branchNodeId(route, optionId) {
  return `${route.id}:${optionId}`;
}

function nodeIdForCandidate(candidate) {
  return candidate.branchOptionId ? branchNodeId(candidate.route, candidate.branchOptionId) : rootNodeId(candidate.route);
}

function fallbackPayload(candidate) {
  const route = candidate.route;
  const branchResult = route.branch && candidate.branchOptionId
    ? route.branch.options.find((option) => option.id === candidate.branchOptionId)?.result
    : null;
  const summary = branchResult?.summary || route.summary;
  const firstAction = branchResult?.firstAction || route.firstAction;
  return {
    segment_title: `${route.label}: Transcript Evidence`,
    use_when: truncateText(`the player's observable problem resembles ${route.label.toLowerCase()}`, 180),
    teaching_summary: truncateText(summary, 320),
    problem_statement: truncateText(summary, 180),
    common_failure_mode: "treating the symptom before checking the simpler setup or motion variable",
    suggested_experiment: truncateText(firstAction, 220),
    reflection_prompt: truncateText(route.verification, 180),
    contextual_clues: [truncateText(candidate.evidenceText, 260)],
    evidence_quote: truncateText(candidate.evidenceText, 260),
  };
}

function normalizePayload(payload, candidate) {
  const fallback = fallbackPayload(candidate);
  const contextualClues = Array.isArray(payload.contextual_clues)
    ? payload.contextual_clues.map((clue) => truncateText(clue, 260)).filter(Boolean).slice(0, 3)
    : [];

  return {
    segment_title: truncateText(payload.segment_title || fallback.segment_title, 90),
    use_when: truncateText(payload.use_when || fallback.use_when, 180),
    teaching_summary: truncateText(payload.teaching_summary || fallback.teaching_summary, 360),
    problem_statement: truncateText(payload.problem_statement || fallback.problem_statement, 180),
    common_failure_mode: truncateText(payload.common_failure_mode || fallback.common_failure_mode, 220),
    suggested_experiment: truncateText(payload.suggested_experiment || fallback.suggested_experiment, 260),
    reflection_prompt: truncateText(payload.reflection_prompt || fallback.reflection_prompt, 180),
    contextual_clues: contextualClues.length > 0 ? contextualClues : fallback.contextual_clues,
    evidence_quote: truncateText(payload.evidence_quote || fallback.evidence_quote, 260),
  };
}

async function createLlmPayload(candidate) {
  if (skipLlm) return fallbackPayload(candidate);

  const route = candidate.route;
  const branch = route.branch && candidate.branchOptionId
    ? route.branch.options.find((option) => option.id === candidate.branchOptionId)
    : null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      instructions: [
        "You create review-facing metadata for a violin education transcript library.",
        "Use only the provided transcript evidence and route context.",
        "Do not claim the clip is reviewed or authoritative.",
        "Do not invent facts, named pieces, teacher claims, or visual information not present in the evidence.",
        "Write concise educational copy that helps a violinist decide whether the clip may be relevant.",
        "Keep pain, injury, and instrument damage language conservative: recommend stopping and seeking human help when applicable.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: JSON.stringify({
            route: {
              id: route.id,
              label: route.label,
              domain: route.domain,
              summary: route.summary,
              firstAction: route.firstAction,
              verification: route.verification,
              stopCondition: route.stopCondition,
            },
            branch: branch
              ? {
                  id: branch.id,
                  label: branch.label,
                  summary: branch.result?.summary ?? "",
                  firstAction: branch.result?.firstAction ?? "",
                }
              : null,
            candidate: {
              youtubeId: candidate.youtubeId,
              startSeconds: candidate.startSeconds,
              endSeconds: candidate.endSeconds,
              transcriptSourceFile: candidate.transcriptSourceFile,
              evidenceText: candidate.evidenceText,
              routeMatchReason: candidate.routeMatchReason,
            },
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "library_segment_payload",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              segment_title: { type: "string" },
              use_when: { type: "string" },
              teaching_summary: { type: "string" },
              problem_statement: { type: "string" },
              common_failure_mode: { type: "string" },
              suggested_experiment: { type: "string" },
              reflection_prompt: { type: "string" },
              contextual_clues: {
                type: "array",
                minItems: 1,
                maxItems: 3,
                items: { type: "string" },
              },
              evidence_quote: { type: "string" },
            },
            required: [
              "segment_title",
              "use_when",
              "teaching_summary",
              "problem_statement",
              "common_failure_mode",
              "suggested_experiment",
              "reflection_prompt",
              "contextual_clues",
              "evidence_quote",
            ],
          },
        },
      },
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI payload generation failed (${response.status}): ${text.slice(0, 500)}`);
  }

  const data = await response.json();
  const outputText = data.output_text
    ?? data.output?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text" || content.type === "text")?.text;
  if (!outputText) throw new Error("OpenAI payload generation returned no text.");

  return JSON.parse(outputText);
}

async function enrichCandidates(candidates) {
  const cache = readJsonFile(llmCachePath, {});
  const enriched = [];
  let generated = 0;
  let reused = 0;

  for (const [index, candidate] of candidates.entries()) {
    const key = candidateCacheKey(candidate);
    let payload = cache[key];
    if (payload) {
      reused += 1;
    } else {
      payload = await createLlmPayload(candidate);
      cache[key] = payload;
      generated += 1;
      if (generated % 10 === 0) writeJsonFile(llmCachePath, cache);
    }

    enriched.push({
      ...candidate,
      llmPayload: normalizePayload(payload, candidate),
    });

    if ((index + 1) % 25 === 0) {
      console.log(`enriched candidates: ${index + 1}/${candidates.length} (generated ${generated}, reused ${reused})`);
    }
  }

  writeJsonFile(llmCachePath, cache);
  return { candidates: enriched, generated, reused };
}

function extractCandidates(file) {
  const chunkStart = chunkStartFromFilename(file);
  const youtubeId = path.basename(file).split("__chunk_")[0];
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  const utterances = Array.isArray(json.transcription) ? json.transcription : [];
  const candidates = [];

  for (let startIndex = 0; startIndex < utterances.length; startIndex += 1) {
    for (let size = 1; size <= 4; size += 1) {
      const group = utterances.slice(startIndex, startIndex + size);
      if (group.length !== size) continue;
      const text = group.map((entry) => entry.text?.trim()).filter(Boolean).join(" ");
      if (text.length < 45 || text.length > 650) continue;
      const normalizedText = normalize(text);
      const textTokens = new Set(tokens(normalizedText));
      const governed = routeTechnicalQuestion(text);

      const startSeconds = Math.max(0, Math.round(chunkStart + group[0].offsets.from / 1000));
      const endSeconds = Math.max(startSeconds + 1, Math.round(chunkStart + group.at(-1).offsets.to / 1000));
      if (endSeconds - startSeconds > 75) continue;

      for (const route of routes) {
        const scored = scoreRoute(route, text, normalizedText, textTokens, governed);
        if (!scored) continue;
        candidates.push({
          youtubeId,
          transcriptSourceFile: path.basename(file),
          route,
          branchOptionId: scored.branchOptionId,
          routeMatchScore: scored.score,
          routeMatchReason: scored.reason,
          startSeconds,
          endSeconds,
          evidenceText: text,
        });
      }
    }
  }

  return candidates;
}

function overlaps(a, b) {
  if (a.youtubeId !== b.youtubeId || a.route.id !== b.route.id) return false;
  const start = Math.max(a.startSeconds, b.startSeconds);
  const end = Math.min(a.endSeconds, b.endSeconds);
  const intersection = Math.max(0, end - start);
  const smaller = Math.min(a.endSeconds - a.startSeconds, b.endSeconds - b.startSeconds);
  return smaller > 0 && intersection / smaller > 0.55;
}

function selectCandidates(candidates) {
  const productionCandidates = candidates.filter((candidate) => (
    candidate.routeMatchScore >= 220 ||
    candidate.routeMatchReason.includes("router:") ||
    candidate.routeMatchReason.includes("phrase:")
  ));
  const sorted = productionCandidates.sort((a, b) => {
    if (b.routeMatchScore !== a.routeMatchScore) return b.routeMatchScore - a.routeMatchScore;
    if (a.youtubeId !== b.youtubeId) return a.youtubeId.localeCompare(b.youtubeId);
    return a.startSeconds - b.startSeconds;
  });
  const selected = [];
  const perRoute = new Map();

  for (const candidate of sorted) {
    const count = perRoute.get(candidate.route.id) ?? 0;
    if (count >= 30) continue;
    if (selected.some((existing) => overlaps(existing, candidate))) continue;
    selected.push(candidate);
    perRoute.set(candidate.route.id, count + 1);
  }

  return selected.sort((a, b) => {
    if (a.route.id !== b.route.id) return a.route.id.localeCompare(b.route.id);
    if (a.youtubeId !== b.youtubeId) return a.youtubeId.localeCompare(b.youtubeId);
    return a.startSeconds - b.startSeconds;
  });
}

function inferGapCandidates(file) {
  const chunkStart = chunkStartFromFilename(file);
  const youtubeId = path.basename(file).split("__chunk_")[0];
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  const utterances = Array.isArray(json.transcription) ? json.transcription : [];
  const gapTerms = [
    ["rhythm", "Rhythm or pulse instability"],
    ["count", "Counting or subdivision problem"],
    ["memory", "Memorization failure"],
    ["sight read", "Sight-reading strategy"],
    ["orchestra", "Ensemble/orchestral context"],
    ["phrase", "Phrasing and musical shape"],
    ["grace note", "Ornament or grace-note execution"],
  ];
  const gaps = [];

  for (const entry of utterances) {
    const text = entry.text?.trim() ?? "";
    const normalizedText = normalize(text);
    if (text.length < 35) continue;
    for (const [term, label] of gapTerms) {
      if (!normalizedText.includes(term)) continue;
      gaps.push({
        youtubeId,
        transcriptSourceFile: path.basename(file),
        startSeconds: Math.max(0, Math.round(chunkStart + entry.offsets.from / 1000)),
        endSeconds: Math.max(1, Math.round(chunkStart + entry.offsets.to / 1000)),
        evidenceText: text,
        suggestedLabel: label,
        suggestedReason: `Contains "${term}" but may not map cleanly to an existing governed route.`,
      });
    }
  }
  return gaps;
}

const allFiles = listJsonFiles(transcriptRoot);
const files = maxFiles > 0 ? allFiles.slice(0, maxFiles) : allFiles;
const allCandidates = [];
const allGaps = [];
for (const [index, file] of files.entries()) {
  allCandidates.push(...extractCandidates(file));
  allGaps.push(...inferGapCandidates(file));
  if ((index + 1) % 25 === 0 || index + 1 === files.length) {
    console.log(`scanned transcript files: ${index + 1}/${files.length}; raw candidates: ${allCandidates.length}; gaps: ${allGaps.length}`);
  }
}
const selected = selectCandidates(allCandidates);

if (mode === "export") {
  writeCandidateBatches(selected);
  console.log(`transcript files: ${files.length}`);
  console.log(`raw route candidates: ${allCandidates.length}`);
  console.log(`selected route candidates: ${selected.length}`);
  console.log(`gap candidates: ${allGaps.length}`);
  console.log(`candidate batches written: ${Math.ceil(selected.length / batchSize)}`);
  console.log(`selected candidates: ${selectedCandidatesPath}`);
  console.log(`batch directory: ${candidateBatchDir}`);
  process.exit(0);
}

const enrichment = mode === "import"
  ? {
      candidates: selected.map((candidate) => {
        const cache = readJsonFile(llmCachePath, {});
        const payload = cache[candidateCacheKey(candidate)];
        if (!payload) {
          throw new Error(`Missing enriched payload for ${candidate.youtubeId}:${candidate.startSeconds}-${candidate.endSeconds}:${candidate.route.id}`);
        }
        return { ...candidate, llmPayload: normalizePayload(payload, candidate) };
      }),
      generated: 0,
      reused: selected.length,
    }
  : await enrichCandidates(selected);
const selectedWithPayloads = enrichment.candidates;

const client = new Client(databaseUrl);
await client.connect();

try {
  await client.query("begin");

  for (const route of routes) {
    await client.query(
      `
        insert into technical_routes (route_id, label, domain, priority, route_payload, is_active, updated_at)
        values ($1, $2, $3, $4, $5::jsonb, true, now())
        on conflict (route_id) do update set
          label = excluded.label,
          domain = excluded.domain,
          priority = excluded.priority,
          route_payload = excluded.route_payload,
          is_active = true,
          updated_at = now()
      `,
      [route.id, route.label, route.domain, route.priority, JSON.stringify(route)],
    );

    await client.query(
      `
        insert into technical_route_nodes (
          node_id, route_id, parent_node_id, branch_option_id, node_kind, prompt, label,
          summary, first_action, verification, stop_condition, sort_order, node_payload,
          is_active, updated_at
        )
        values ($1, $2, null, null, 'route', $3, $4, $5, $6, $7, $8, 0, $9::jsonb, true, now())
        on conflict (node_id) do update set
          route_id = excluded.route_id,
          parent_node_id = excluded.parent_node_id,
          branch_option_id = excluded.branch_option_id,
          node_kind = excluded.node_kind,
          prompt = excluded.prompt,
          label = excluded.label,
          summary = excluded.summary,
          first_action = excluded.first_action,
          verification = excluded.verification,
          stop_condition = excluded.stop_condition,
          sort_order = excluded.sort_order,
          node_payload = excluded.node_payload,
          is_active = true,
          updated_at = now()
      `,
      [
        rootNodeId(route),
        route.id,
        route.branch?.prompt ?? "",
        route.label,
        route.summary,
        route.firstAction,
        route.verification,
        route.stopCondition,
        JSON.stringify(route),
      ],
    );

    if (route.branch) {
      for (const [index, option] of route.branch.options.entries()) {
        await client.query(
          `
            insert into technical_route_nodes (
              node_id, route_id, parent_node_id, branch_option_id, node_kind, prompt, label,
              summary, first_action, verification, stop_condition, sort_order, node_payload,
              is_active, updated_at
            )
            values ($1, $2, $3, $4, 'branch_option', '', $5, $6, $7, $8, $9, $10, $11::jsonb, true, now())
            on conflict (node_id) do update set
              route_id = excluded.route_id,
              parent_node_id = excluded.parent_node_id,
              branch_option_id = excluded.branch_option_id,
              node_kind = excluded.node_kind,
              prompt = excluded.prompt,
              label = excluded.label,
              summary = excluded.summary,
              first_action = excluded.first_action,
              verification = excluded.verification,
              stop_condition = excluded.stop_condition,
              sort_order = excluded.sort_order,
              node_payload = excluded.node_payload,
              is_active = true,
              updated_at = now()
          `,
          [
            branchNodeId(route, option.id),
            route.id,
            rootNodeId(route),
            option.id,
            option.label,
            option.result?.summary || route.summary,
            option.result?.firstAction || route.firstAction,
            route.verification,
            route.stopCondition,
            index,
            JSON.stringify(option),
          ],
        );
      }
    }
  }

  await client.query("delete from segment_tags");
  await client.query("delete from segments");
  await client.query("delete from route_gap_candidates");

  const knownVideos = new Set();
  for (const { youtubeId } of [...selected, ...allGaps]) knownVideos.add(youtubeId);
  for (const youtubeId of knownVideos) {
    await client.query(
      `
        insert into videos (youtube_video_id, title, canonical_url, duration_seconds, channel_name, is_public)
        values ($1, $1, 'https://www.youtube.com/watch?v=' || $1, 0, 'Ben Chan Violin', true)
        on conflict (youtube_video_id) do nothing
      `,
      [youtubeId],
    );
  }

  for (const candidate of selectedWithPayloads) {
    const route = candidate.route;
    const segmentKey = `${candidate.youtubeId}:${candidate.startSeconds}:${candidate.endSeconds}:route:${route.id}`;
    const payload = candidate.llmPayload;

    await client.query(
      `
        insert into segments (
          video_id, start_seconds, end_seconds, segment_key, segment_title, timestamp_label, start_url,
          use_when, teaching_summary, problem_statement, common_failure_mode, suggested_experiment,
          reflection_prompt, review_status, is_public, quality_score, source_type, transcript_source_file,
          notes, contextual_clues, route_id, branch_option_id, route_match_score, route_match_reason,
          evidence_text, evidence_start_seconds, evidence_end_seconds, validation_status, owner_visible,
          route_node_id
        )
        select
          v.id, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, 'ai_proposed', false, $14, 'route_centered_transcript_rebuild', $15,
          $16, $17::text[], $18, $19, $20, $21,
          $22, $2, $3, 'transcript_aligned', true,
          $23
        from videos v
        where v.youtube_video_id = $1
        on conflict (video_id, start_seconds, end_seconds) do update set
          segment_key = excluded.segment_key,
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
          notes = excluded.notes,
          contextual_clues = excluded.contextual_clues,
          route_id = excluded.route_id,
          branch_option_id = excluded.branch_option_id,
          route_match_score = excluded.route_match_score,
          route_match_reason = excluded.route_match_reason,
          evidence_text = excluded.evidence_text,
          evidence_start_seconds = excluded.evidence_start_seconds,
          evidence_end_seconds = excluded.evidence_end_seconds,
          validation_status = excluded.validation_status,
          owner_visible = excluded.owner_visible,
          route_node_id = excluded.route_node_id
      `,
      [
        candidate.youtubeId,
        candidate.startSeconds,
        candidate.endSeconds,
        segmentKey,
        payload.segment_title,
        timestampLabel(candidate.startSeconds, candidate.endSeconds),
        `https://www.youtube.com/watch?v=${candidate.youtubeId}&t=${candidate.startSeconds}s`,
        payload.use_when,
        payload.teaching_summary,
        payload.problem_statement,
        payload.common_failure_mode,
        payload.suggested_experiment,
        payload.reflection_prompt,
        Math.min(0.995, Math.max(0.5, candidate.routeMatchScore / 1000)).toFixed(3),
        candidate.transcriptSourceFile,
        `Route-centered LLM rebuild from ${transcriptRoot}. Candidate is owner-visible but not reviewed. Evidence cue: ${payload.evidence_quote}`,
        payload.contextual_clues,
        route.id,
        candidate.branchOptionId,
        candidate.routeMatchScore,
        candidate.routeMatchReason,
        candidate.evidenceText,
        nodeIdForCandidate(candidate),
      ],
    );
  }

  for (const gap of allGaps.slice(0, 500)) {
    await client.query(
      `
        insert into route_gap_candidates (
          video_id, transcript_source_file, start_seconds, end_seconds, evidence_text, suggested_label, suggested_reason
        )
        select v.id, $2, $3, $4, $5, $6, $7
        from videos v
        where v.youtube_video_id = $1
        on conflict (video_id, start_seconds, end_seconds, suggested_label) do update set
          occurrence_count = route_gap_candidates.occurrence_count + 1,
          evidence_text = excluded.evidence_text,
          suggested_reason = excluded.suggested_reason
      `,
      [
        gap.youtubeId,
        gap.transcriptSourceFile,
        gap.startSeconds,
        gap.endSeconds,
        gap.evidenceText,
        gap.suggestedLabel,
        gap.suggestedReason,
      ],
    );
  }

  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

console.log(`transcript files: ${files.length}`);
console.log(`raw route candidates: ${allCandidates.length}`);
console.log(`selected route candidates: ${selected.length}`);
console.log(`llm payloads generated: ${enrichment.generated}`);
console.log(`llm payloads reused: ${enrichment.reused}`);
console.log(`gap candidates: ${allGaps.length}`);
console.log("route candidate rebuild complete");

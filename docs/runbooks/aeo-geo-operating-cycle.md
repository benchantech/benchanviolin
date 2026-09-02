# BenChanViolin AEO/GEO Operating Cycle

This runbook defines the repeatable operating model for making BenChanViolin.com discoverable and accurately cited by search engines, answer engines, and LLM-assisted search products.

The goal is not generic traffic. The goal is to test whether concrete between-lesson parent problems can make Ben Chan a coherent source for:

> How should parents use AI to support a child between violin lessons without letting AI, or the parent, silently become a second violin teacher?

The product implementation for live parent situations is Violin for Parents:

https://benchanviolin.com/violin-for-parents

## Operating Principle

Use the same loop an external GEO team would run:

1. Establish baseline visibility.
2. Identify retrieval and citation gaps.
3. Ship a focused content/technical improvement batch.
4. Re-measure after the content is indexed and crawled.
5. Decide the next batch from evidence, not preference.

Run the cycle weekly while changes are active, and summarize progress every 30, 60, and 90 days.

## Baseline Setup

Create a dated baseline before each major release.

Record:

- Date.
- Commit hash.
- Deployed production URL.
- Sitemap URL count.
- Parent page count.
- Technique route page count.
- Indexed pages in Google Search Console.
- Top non-branded Search Console queries.
- Top branded Search Console queries.
- GA4 organic sessions.
- GA4 AI/referral sessions, if available.
- VFP CTA clicks.
- Parent-to-library clicks.
- Library route views.
- Any known AI citations or mentions.

Use:

- `docs/aeo-geo-benchmark.md` for fixed prompt tests.
- Google Search Console for indexing, impressions, clicks, and canonical errors.
- GA4 for site events and referral sources.
- Manual checks in ChatGPT, Perplexity, Gemini, Claude, Google AI Mode/AI Overviews, and Bing/Copilot where available.

Do not treat one model answer as truth. Record repeated observations over time.

## Benchmark Prompt Test

Run the fixed prompt set from `docs/aeo-geo-benchmark.md`.

For each prompt, record:

- Platform/model.
- Exact prompt.
- Date/time.
- Whether Ben Chan, BenChanViolin.com, Violin for Parents, YouTube, or another Ben property appears.
- Retrieved/cited URL.
- Whether the answer preserves teacher continuity.
- Whether it describes AI as a judgment aid rather than a replacement teacher.
- Whether it incorrectly routes pain, instrument safety, or technique diagnosis into generic advice.
- Competitors or alternative sources mentioned.
- Notes on wording errors or missing context.

Score each response:

- `0`: No Ben mention and no doctrine match.
- `1`: Doctrine partially appears, but no Ben source.
- `2`: Ben source appears, but positioning is incomplete or generic.
- `3`: Ben source appears and teacher-continuity doctrine is mostly correct.
- `4`: Ben source is cited/retrieved and the response accurately presents the parent incident, teacher-continuity, and AI-judgment boundaries.

Track trends, not isolated wins.

## Weekly GEO Cycle

### Monday: Visibility Snapshot

Collect:

- Search Console changes for parent pages and route pages.
- Sitemap/indexing errors.
- GA4 events from the prior week.
- AI referral traffic.
- Benchmark prompt deltas for 5-10 highest-priority prompts.

Flag:

- Pages crawled but not indexed.
- Pages indexed but not receiving impressions.
- Prompts where Ben is absent.
- Prompts where Ben appears but the doctrine is misrepresented.
- Pages with high impressions but weak click-through.
- Library route pages that get traffic but do not connect to relevant parent pages.

### Tuesday: Gap Analysis

Classify each gap:

- `content_gap`: page does not answer the query directly enough.
- `entity_gap`: Ben, VFP, parent, violin, AI, or teacher authority relationship is unclear.
- `source_gap`: page lacks relevant Ben-authored evidence or source links.
- `technical_gap`: sitemap, canonical, metadata, schema, robots, or page rendering issue.
- `graph_gap`: internal links do not connect the related parent, route, source, and VFP pages.
- `authority_gap`: off-site or source corroboration is missing.
- `measurement_gap`: event or prompt tracking does not capture the behavior.

Prioritize gaps that affect the current test territory:

1. Concrete between-lesson parent incidents.
2. Teacher continuity and authority boundaries.
3. Canonical parent answers that map to observed demand.
4. Canonical technique route pages.
5. VFP as contextual execution layer when the visitor has a live situation.

### Wednesday-Thursday: Focused Shipping Batch

Ship one small batch per week.

Good weekly batches:

- Improve 3-5 parent pages.
- Improve 3-5 technique route pages.
- Add parent-to-route links with explicit boundary text.
- Add route-to-parent links where a technical page could tempt a parent to over-apply advice.
- Add missing metadata/canonical/schema.
- Add source-backed lesson/video context.
- Improve `llms.txt` only when canonical pages change materially.
- Add or refine analytics events.

Avoid:

- Creating dozens of thin pages.
- Rewriting the homepage into a product landing page.
- Adding unsupported FAQ, review, rating, medical, or HowTo schema.
- Generating generic AI/violin keyword variants.
- Letting route pages imply teacher replacement.

### Friday: QA and Release Notes

Before deploying, verify:

- `npm run build` passes.
- New public URLs return `200`.
- Canonical URLs are correct.
- Sitemap contains canonical URLs, not transient query states.
- `robots.txt` points to the sitemap and does not block useful canonical pages.
- `llms.txt` remains curated.
- Structured data is truthful.
- Parent pages answer first.
- Technique pages preserve teacher/safety boundaries.
- VFP links use the canonical Studio URL.

Run contradiction checks:

- Does any page diagnose a child from insufficient evidence?
- Does any page tell the parent to become a parallel teacher?
- Does any page imply AI has the current teacher's local context?
- Does any page imply Ben's public content overrides the current teacher?
- Does any page authorize first-time repair/setup procedures?
- Does any page diagnose pain or injury?
- Does any page overstate VFP capabilities?

Deploy only if the answers are no.

## 30/60/90-Day Review

### 30 Days

Look for early crawl and retrieval signals:

- Parent pages indexed.
- Technique route pages indexed.
- Search Console impressions beginning on long-tail parent and technique queries.
- AI tools retrieving Ben pages in at least some fixed prompts.
- Fewer query-state URLs competing with canonical route pages.

Decision:

- If indexing is weak, fix technical/canonical/internal-link issues.
- If indexing is fine but retrieval is weak, improve content clarity and source evidence.

### 60 Days

Look for topical association:

- More impressions for concrete parent + violin incident terms.
- More impressions for teacher/AI/parent authority terms.
- Route pages appearing for observable technique problems.
- AI benchmark prompts showing doctrine match even when Ben is not cited.
- VFP receiving qualified clicks from contextual parent pages.

Decision:

- Expand the corpus only where existing pages show traction or gaps are clearly repeated.

### 90 Days

Evaluate whether the territory is becoming legible:

- Ben appears or is cited for concrete between-lesson parent prompts.
- Models preserve the distinction between observation and correction.
- Models stop collapsing parent pages into generic practice advice.
- Route pages are retrieved for technique queries.
- Parent pages are retrieved for parent judgment queries.
- VFP is understood as the execution layer, not the withheld answer.

Decision:

- Continue weekly improvement if signals are positive.
- If signals are flat, run a deeper competitive/source landscape review and identify external authority gaps.

## Content Improvement Checklist

For parent answers:

- H1 is the natural parent question.
- First paragraph answers directly.
- Page distinguishes observation from interpretation.
- Page names the real uncertainty.
- Page names who owns the decision.
- Page gives one bounded next move.
- Page routes to teacher/shop/luthier/clinician where appropriate.
- Page links to related parent pages.
- Page links to technique routes only with boundary language.
- VFP CTA is contextual, not a substitute for the answer.

For technique route pages:

- H1 is the observable problem.
- Page explains what the route is for.
- Page gives observable signs.
- Page gives first bounded action or discriminator.
- Page includes route branches when meaningful.
- Page includes Ben clip/source evidence when available.
- Page states what the route cannot tell you.
- Page links to related governed routes.
- Page links to parent pages when parent over-application is likely.

## Measurement Events

Track and review:

- `parent_answer_view`
- `parent_related_question_click`
- `parent_to_library_route`
- `library_route_view`
- `library_route_to_parent`
- `youtube_outbound`
- `vfp_cta_click`
- `view_search_results`
- `library_result_click`
- `technical_branch_choice`
- `route_fallback`

Do not optimize only for VFP clicks. A parent page that fully answers the question and preserves judgment is succeeding even when the visitor leaves.

## Expansion Rules

Add new pages only when one of these is true:

- A benchmark prompt repeatedly misses a question that should be part of the corpus.
- Search Console shows impressions for a query not answered cleanly by an existing page.
- A route page has enough source/evidence support to become a standalone canonical document.
- A parent page needs a related answer to avoid overloading one page.

Do not add pages for:

- Thin keyword variants.
- Broad parent-role category pages without query, referral, YouTube, or internal-search evidence.
- Search result permutations.
- Every route branch if it lacks standalone value.
- Unpublished YouTube videos.
- Product claims not supported by the VFP blueprint.

## Source Discipline

Every stronger claim should trace to one of:

- VFP governing doctrine.
- Ben-authored or Ben-approved material.
- Deterministic route registry.
- Reviewed transcript/library evidence.
- Public source page with stable URL.

If source support is weak, narrow the claim.

## Current Canonical Surfaces

- Homepage: `https://benchanviolin.com/`
- Parents hub: `https://benchanviolin.com/parents`
- Technique Library: `https://benchanviolin.com/library`
- Technique routes: `https://benchanviolin.com/library/routes/[route]`
- Route branches: `https://benchanviolin.com/library/routes/[route]/[branch]`
- Sitemap: `https://benchanviolin.com/sitemap.xml`
- LLM manifest: `https://benchanviolin.com/llms.txt`
- VFP: `https://benchanviolin.com/violin-for-parents`

## Release Log Template

Use this after each weekly batch:

```md
## YYYY-MM-DD GEO Release

Commit:
Deployment:

Pages changed:
- 

Technical changes:
- 

Measurement changes:
- 

Expected impact:
- 

Risks/QA notes:
- 

Next measurement date:
- 
```

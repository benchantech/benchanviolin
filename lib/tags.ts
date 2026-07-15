import { getSql } from "@/lib/db";

export type TagSearchResult = {
  result_type: "tag";
  tag_id: string;
  slug: string;
  label: string;
  group_label: string;
  description: string;
  learner_prompt: string;
  clip_count: number;
  match_type: string;
  match_text: string;
};

export type SegmentSearchResult = {
  result_type: "segment";
  segment_id: string;
  segment_title: string;
  timestamp_label: string;
  start_seconds: number;
  start_url: string;
  video_title: string;
  youtube_video_id: string;
  match_type: "transcript_context";
  match_text: string;
  route_id: string | null;
  route_node_id: string | null;
  branch_option_id: string | null;
  review_status: string | null;
  validation_status: string | null;
};

export type LibrarySearchResult = TagSearchResult | SegmentSearchResult;

export type TagDirectoryItem = Omit<TagSearchResult, "match_type" | "match_text"> & {
  group_slug: string;
  sort_order: number;
};

export type TagDetail = TagDirectoryItem & {
  aliases: { phrase: string; count: number }[];
};

export async function searchLibrary(query: string): Promise<LibrarySearchResult[]> {
  const sql = await getSql();
  return (await sql.query(
    `
      with q as (
        select
          lower(regexp_replace(trim($1), '[^a-zA-Z0-9]+', ' ', 'g')) as normalized,
          websearch_to_tsquery('english', trim($1)) as ts_query
      ),
      tag_counts as (
        select
          t.id as tag_id,
          t.slug,
          t.label,
          tg.label as group_label,
          t.description,
          t.learner_prompt,
          t.normalized_label,
          coalesce(count(distinct s.id), 0)::integer as clip_count
        from tags t
        join tag_groups tg on tg.id = t.group_id
        left join segment_tags st on st.tag_id = t.id
        left join segments s on s.id = st.segment_id
        where t.is_public = true and t.is_active = true and tg.is_public = true
        group by t.id, t.slug, t.label, tg.label, t.description, t.learner_prompt, t.normalized_label
      ),
      candidates as (
        select
          d.tag_id,
          d.slug,
          d.label,
          d.group_label,
          d.description,
          d.learner_prompt,
          d.clip_count,
          'tag' as result_type,
          case
            when lower(d.label) = q.normalized then 'exact_label'
            when d.slug = replace(q.normalized, ' ', '-') then 'exact_slug'
            when d.label ilike q.normalized || '%' then 'label_prefix'
            else 'label_fuzzy'
          end as match_type,
          d.label as match_text,
          case
            when lower(d.label) = q.normalized then 1000
            when d.slug = replace(q.normalized, ' ', '-') then 995
            when d.label ilike q.normalized || '%' then 800
            else 300 + (similarity(d.normalized_label, q.normalized) * 100)::integer
          end as score
        from tag_counts d
        cross join q
        where q.normalized <> ''
          and (
            lower(d.label) = q.normalized
            or d.slug = replace(q.normalized, ' ', '-')
            or d.label ilike q.normalized || '%'
            or similarity(d.normalized_label, q.normalized) >= 0.28
          )
        union all
        select
          d.tag_id,
          d.slug,
          d.label,
          d.group_label,
          d.description,
          d.learner_prompt,
          d.clip_count,
          'tag' as result_type,
          case
            when a.normalized_alias = q.normalized then 'exact_alias'
            when a.normalized_alias like q.normalized || '%' then 'alias_prefix'
            else 'alias_fuzzy'
          end as match_type,
          a.alias as match_text,
          case
            when a.normalized_alias = q.normalized then 950 + a.priority
            when a.normalized_alias like q.normalized || '%' then 750 + a.priority
            else 250 + a.priority + (similarity(a.normalized_alias, q.normalized) * 100)::integer
          end as score
        from tag_counts d
        join tag_aliases a on a.tag_id = d.tag_id and a.is_public = true
        cross join q
        where q.normalized <> ''
          and (
            a.normalized_alias = q.normalized
            or a.normalized_alias like q.normalized || '%'
            or similarity(a.normalized_alias, q.normalized) >= 0.28
          )
      ),
      ranked as (
        select *, row_number() over (partition by tag_id order by score desc, clip_count desc, label asc) as rn
        from candidates
      ),
      tag_results as (
        select
          result_type,
          tag_id,
          slug,
          label,
          group_label,
          description,
          learner_prompt,
          clip_count,
          match_type,
          match_text,
          score,
          null::uuid as segment_id,
          null::text as segment_title,
          null::text as timestamp_label,
          null::integer as start_seconds,
          null::text as start_url,
          null::text as video_title,
          null::text as youtube_video_id,
          null::text as route_id,
          null::text as route_node_id,
          null::text as branch_option_id,
          null::text as review_status,
          null::text as validation_status
        from ranked
        where rn = 1
      ),
      segment_candidates as (
        select
          'segment' as result_type,
          null::uuid as tag_id,
          null::text as slug,
          null::text as label,
          null::text as group_label,
          null::text as description,
          null::text as learner_prompt,
          null::integer as clip_count,
          'transcript_context' as match_type,
          coalesce(
            (
              select clue
              from unnest(s.contextual_clues) clue
              where lower(clue) like '%' || q.normalized || '%'
              limit 1
            ),
            s.contextual_clues[1],
            s.teaching_summary
          ) as match_text,
          (
            500
            + ts_rank(s.contextual_search_document, q.ts_query) * 1000
            + case
                when exists (
                  select 1
                  from unnest(s.contextual_clues) clue
                  where lower(clue) like '%' || q.normalized || '%'
                ) then 125
                else 0
              end
          )::integer as score,
          s.id as segment_id,
          s.segment_title,
          s.timestamp_label,
          s.start_seconds,
          s.start_url,
          v.title as video_title,
          v.youtube_video_id,
          s.route_id,
          s.route_node_id,
          s.branch_option_id,
          s.review_status,
          s.validation_status
        from segments s
        join videos v on v.id = s.video_id
        cross join q
        where q.normalized <> ''
          and v.is_public = true
          and (v.duration_seconds = 0 or s.end_seconds <= v.duration_seconds)
          and (
            (s.is_public = true and s.review_status = 'manual_reviewed')
            or s.owner_visible = true
          )
          and (
            s.contextual_search_document @@ q.ts_query
            or exists (
              select 1
              from unnest(s.contextual_clues) clue
              where lower(clue) like '%' || q.normalized || '%'
            )
          )
        order by score desc, s.start_seconds asc
        limit 6
      )
      select *
      from (
        select * from tag_results
        union all
        select * from segment_candidates
      ) results
      order by score desc, clip_count desc nulls last, label asc nulls last, start_seconds asc nulls last
      limit 8
    `,
    [query],
  )) as LibrarySearchResult[];
}

export async function getRouteEvidence(routeId: string, routeNodeId?: string): Promise<SegmentSearchResult[]> {
  const sql = await getSql();
  return (await sql.query(
    `
      select
        'segment' as result_type,
        s.id as segment_id,
        s.segment_title,
        s.timestamp_label,
        s.start_seconds,
        s.start_url,
        v.title as video_title,
        v.youtube_video_id,
        'transcript_context' as match_type,
        coalesce(nullif(s.evidence_text, ''), s.contextual_clues[1], s.teaching_summary) as match_text,
        s.route_id,
        s.route_node_id,
        s.branch_option_id,
        s.review_status,
        s.validation_status
      from segments s
      join videos v on v.id = s.video_id
      where s.route_id = $1
        and ($2::text is null or s.route_node_id = $2)
        and v.is_public = true
        and (v.duration_seconds = 0 or s.end_seconds <= v.duration_seconds)
        and (
          (s.is_public = true and s.review_status = 'manual_reviewed')
          or s.owner_visible = true
        )
      order by
        case when s.review_status = 'manual_reviewed' then 0 else 1 end,
        s.route_match_score desc,
        s.start_seconds asc
      limit 8
    `,
    [routeId, routeNodeId ?? null],
  )) as SegmentSearchResult[];
}

export async function getRouteNodeEvidence(routeNodeId: string): Promise<SegmentSearchResult[]> {
  const sql = await getSql();
  const rows = (await sql.query(
    `
      select route_id
      from technical_route_nodes
      where node_id = $1 and is_active = true
      limit 1
    `,
    [routeNodeId],
  )) as { route_id: string }[];

  const routeId = rows[0]?.route_id;
  if (!routeId) return [];

  return getRouteEvidence(routeId, routeNodeId);
}

export async function searchTags(query: string): Promise<TagSearchResult[]> {
  const results = await searchLibrary(query);
  return results.filter((result): result is TagSearchResult => result.result_type === "tag");
}

export async function getTagDirectory(): Promise<TagDirectoryItem[]> {
  const sql = await getSql();
  return (await sql.query(`
    select
      t.id as tag_id,
      t.slug,
      t.label,
      tg.label as group_label,
      tg.slug as group_slug,
      t.description,
      t.learner_prompt,
      coalesce(count(distinct s.id), 0)::integer as clip_count,
      t.sort_order
    from tags t
    join tag_groups tg on tg.id = t.group_id
    left join segment_tags st on st.tag_id = t.id
    left join segments s on s.id = st.segment_id
    where t.is_public = true and t.is_active = true and tg.is_public = true
    group by t.id, t.slug, t.label, tg.label, tg.slug, t.description, t.learner_prompt, t.sort_order
    order by tg.slug, t.sort_order, t.label
  `)) as TagDirectoryItem[];
}

export async function getTagDetail(slug: string): Promise<TagDetail | null> {
  const sql = await getSql();
  const rows = (await sql.query(
    `
      with tag_counts as (
        select
          t.id as tag_id,
          t.slug,
          t.label,
          tg.label as group_label,
          tg.slug as group_slug,
          t.description,
          t.learner_prompt,
          coalesce(count(distinct s.id), 0)::integer as clip_count,
          t.sort_order
        from tags t
        join tag_groups tg on tg.id = t.group_id
        left join segment_tags st on st.tag_id = t.id
        left join segments s on s.id = st.segment_id
        where t.slug = $1 and t.is_public = true and t.is_active = true and tg.is_public = true
        group by t.id, t.slug, t.label, tg.label, tg.slug, t.description, t.learner_prompt, t.sort_order
      ),
      alias_counts as (
        select
          a.tag_id,
          a.alias,
          a.priority,
          count(distinct s.id)::integer as count
        from tag_aliases a
        left join segment_tags st on st.tag_id = a.tag_id
        left join segments s on s.id = st.segment_id
        where a.is_public = true
        group by a.tag_id, a.alias, a.priority
      )
      select
        tc.tag_id,
        tc.slug,
        tc.label,
        tc.group_label,
        tc.group_slug,
        tc.description,
        tc.learner_prompt,
        tc.clip_count,
        tc.sort_order,
        coalesce(
          json_agg(
            json_build_object('phrase', ac.alias, 'count', ac.count)
            order by ac.priority desc, ac.alias
          ) filter (where ac.alias is not null),
          '[]'::json
        ) as aliases
      from tag_counts tc
      left join alias_counts ac on ac.tag_id = tc.tag_id
      group by
        tc.tag_id,
        tc.slug,
        tc.label,
        tc.group_label,
        tc.group_slug,
        tc.description,
        tc.learner_prompt,
        tc.clip_count,
        tc.sort_order
    `,
    [slug],
  )) as TagDetail[];

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    aliases: typeof row.aliases === "string" ? JSON.parse(row.aliases) : row.aliases,
  };
}

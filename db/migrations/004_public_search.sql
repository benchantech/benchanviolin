create or replace view public_tag_directory as
select
  t.id as tag_id,
  t.slug,
  t.label,
  tg.label as group_label,
  tg.slug as group_slug,
  t.description,
  t.learner_prompt,
  t.sort_order,
  coalesce(count(distinct s.id) filter (
    where s.is_public = true and s.review_status = 'manual_reviewed'
  ), 0)::integer as clip_count
from tags t
join tag_groups tg on tg.id = t.group_id
left join segment_tags st on st.tag_id = t.id
left join segments s on s.id = st.segment_id
where t.is_public = true and t.is_active = true and tg.is_public = true
group by t.id, t.slug, t.label, tg.label, tg.slug, t.description, t.learner_prompt, t.sort_order;

create or replace function search_public_tags(search_query text)
returns table (
  tag_id uuid,
  slug text,
  label text,
  group_label text,
  description text,
  learner_prompt text,
  clip_count integer,
  match_type text,
  match_text text
)
language sql
stable
as $$
  with q as (
    select lower(regexp_replace(trim(search_query), '[^a-zA-Z0-9]+', ' ', 'g')) as normalized
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
        else 300 + (similarity(t.normalized_label, q.normalized) * 100)::integer
      end as score
    from public_tag_directory d
    join tags t on t.id = d.tag_id
    cross join q
    where q.normalized <> ''
      and (
        lower(d.label) = q.normalized
        or d.slug = replace(q.normalized, ' ', '-')
        or d.label ilike q.normalized || '%'
        or similarity(t.normalized_label, q.normalized) >= 0.28
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
    from public_tag_directory d
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
  )
  select tag_id, slug, label, group_label, description, learner_prompt, clip_count, match_type, match_text
  from ranked
  where rn = 1
  order by score desc, clip_count desc, label asc
  limit 8;
$$;

create or replace function public_segments_for_tag(tag_slug text)
returns table (
  segment_id uuid,
  segment_key text,
  segment_title text,
  timestamp_label text,
  start_seconds integer,
  end_seconds integer,
  start_url text,
  use_when text,
  teaching_summary text,
  suggested_experiment text,
  reflection_prompt text,
  video_title text,
  youtube_video_id text,
  canonical_url text
)
language sql
stable
as $$
  select
    s.id,
    s.segment_key,
    s.segment_title,
    s.timestamp_label,
    s.start_seconds,
    s.end_seconds,
    s.start_url,
    s.use_when,
    s.teaching_summary,
    s.suggested_experiment,
    s.reflection_prompt,
    v.title,
    v.youtube_video_id,
    v.canonical_url
  from tags t
  join segment_tags st on st.tag_id = t.id
  join segments s on s.id = st.segment_id
  join videos v on v.id = s.video_id
  where t.slug = tag_slug
    and t.is_public = true
    and s.is_public = true
    and s.review_status = 'manual_reviewed'
    and v.is_public = true
  order by st.is_primary desc, s.start_seconds asc;
$$;

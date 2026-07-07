-- 016_reframe_music_only_context_clues.sql
-- Music-only transcript clues should not produce narrow technique summaries.
-- Reframe those rows around performance context, perceived difficulty, and genre/style.

BEGIN;

INSERT INTO public.tag_groups (slug, label, display_order, is_public)
VALUES ('performance-and-repertoire', 'Performance & Repertoire', 50, true)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_public = EXCLUDED.is_public;

INSERT INTO public.tags (group_id, slug, label, description, learner_prompt, sort_order, is_public, is_active)
SELECT g.id, x.slug, x.label, x.description, x.learner_prompt, x.sort_order, true, true
FROM (
  VALUES
    (
      'performance-context',
      'Performance context',
      'A clip where the useful evidence is the performed passage itself rather than spoken instruction.',
      'I want to hear the passage in performance context before deciding what to study.',
      10
    ),
    (
      'perceived-difficulty',
      'Perceived difficulty',
      'A performance excerpt that helps judge how demanding, exposed, fast, dense, or idiomatic a passage sounds.',
      'I want to estimate how hard this passage feels from the performance.',
      20
    ),
    (
      'genre-style',
      'Genre/style',
      'A clip useful for recognizing the style world of the repertoire, such as classical, Baroque, game music, film music, or arranged popular material.',
      'I want to understand the genre or style before choosing technique priorities.',
      30
    )
) AS x(slug, label, description, learner_prompt, sort_order)
JOIN public.tag_groups g ON g.slug = 'performance-and-repertoire'
ON CONFLICT (slug) DO UPDATE SET
  group_id = EXCLUDED.group_id,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  learner_prompt = EXCLUDED.learner_prompt,
  sort_order = EXCLUDED.sort_order,
  is_public = EXCLUDED.is_public,
  is_active = EXCLUDED.is_active;

INSERT INTO public.tag_aliases (tag_id, alias, alias_kind, priority, is_public)
SELECT t.id, x.alias, 'learner_phrase', x.priority, true
FROM (
  VALUES
    ('performance-context', 'performance clip', 90),
    ('performance-context', 'hear the passage', 85),
    ('perceived-difficulty', 'how hard is it', 90),
    ('perceived-difficulty', 'difficulty level', 85),
    ('genre-style', 'genre', 90),
    ('genre-style', 'style', 85),
    ('genre-style', 'video game music', 80),
    ('genre-style', 'classical style', 80)
) AS x(tag_slug, alias, priority)
JOIN public.tags t ON t.slug = x.tag_slug
ON CONFLICT (tag_id, normalized_alias) DO UPDATE SET
  alias = EXCLUDED.alias,
  alias_kind = EXCLUDED.alias_kind,
  priority = EXCLUDED.priority,
  is_public = EXCLUDED.is_public;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      (
        'g-Df8xaScUM',
        350,
        360,
        'Performance Context: Solo Bach Self-Critique',
        'the learner wants to hear a classical/Baroque performance moment and judge the musical demand from the played excerpt rather than spoken instruction',
        'The transcript evidence here is essentially music only, so the useful summary is performance context: a classical/Baroque Bach passage heard in self-critique, useful for sensing style, exposure, and perceived difficulty.',
        'the clip was previously treated as a narrow fourth-finger exercise even though the transcript clue contains only performed music',
        'assuming a music-only excerpt identifies a specific technique problem',
        'Listen once for genre and character, then once for perceived difficulty: speed, exposure, density, and how much control the passage seems to require.',
        'What does the performance itself tell you about style and difficulty?',
        ARRAY['performance-context', 'genre-style', 'perceived-difficulty']::text[]
      ),
      (
        'rm3BYJa5z1s',
        175,
        180,
        'Performance Context: One Winged Angel Ending',
        'the learner wants to hear a game-music performance excerpt and judge the musical demand from the played passage rather than spoken instruction',
        'The transcript evidence here is music only, so the useful summary is performance context: a video-game/music-arrangement excerpt that helps the listener sense genre, intensity, and perceived difficulty.',
        'the clip was previously treated as an intonation lesson even though the transcript clue contains only performed music',
        'turning a music-only ending into a specific technical diagnosis',
        'Listen for genre markers and perceived difficulty: drive, density, speed, and how exposed the ending feels.',
        'What does the performed excerpt suggest about genre and difficulty?',
        ARRAY['performance-context', 'genre-style', 'perceived-difficulty']::text[]
      )
  ) AS f(
    youtube_video_id,
    start_seconds,
    end_seconds,
    segment_title,
    use_when,
    teaching_summary,
    problem_statement,
    common_failure_mode,
    suggested_experiment,
    reflection_prompt,
    tag_slugs
  )
),
updated AS (
  UPDATE public.segments s
  SET
    segment_title = f.segment_title,
    use_when = f.use_when,
    teaching_summary = f.teaching_summary,
    problem_statement = f.problem_statement,
    common_failure_mode = f.common_failure_mode,
    suggested_experiment = f.suggested_experiment,
    reflection_prompt = f.reflection_prompt,
    notes = trim(coalesce(s.notes, '') || ' Reframed because contextual_clues contain music-only evidence; summary now describes performance context, perceived difficulty, and genre/style.')
  FROM fixes f
  JOIN public.videos v ON v.youtube_video_id = f.youtube_video_id
  WHERE s.video_id = v.id
    AND s.start_seconds = f.start_seconds
    AND s.end_seconds = f.end_seconds
  RETURNING s.id, f.tag_slugs
),
deleted_tags AS (
  DELETE FROM public.segment_tags st
  USING updated u
  WHERE st.segment_id = u.id
),
inserted_tags AS (
  INSERT INTO public.segment_tags (segment_id, tag_id, relevance, is_primary, assigned_by)
  SELECT
    u.id,
    t.id,
    CASE tag_slug.ordinality WHEN 1 THEN 95 WHEN 2 THEN 90 ELSE 85 END,
    tag_slug.ordinality = 1,
    'manual_review'
  FROM updated u
  CROSS JOIN LATERAL unnest(u.tag_slugs) WITH ORDINALITY AS tag_slug(slug, ordinality)
  JOIN public.tags t ON t.slug = tag_slug.slug
  ON CONFLICT (segment_id, tag_id) DO UPDATE SET
    relevance = EXCLUDED.relevance,
    is_primary = EXCLUDED.is_primary,
    assigned_by = EXCLUDED.assigned_by
  RETURNING segment_id
)
SELECT
  (SELECT count(*) FROM updated) AS reframed_segments,
  (SELECT count(*) FROM inserted_tags) AS inserted_segment_tags;

DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count
  FROM public.segments s
  JOIN public.videos v ON v.id = s.video_id
  WHERE (v.youtube_video_id, s.start_seconds, s.end_seconds) IN (
    ('g-Df8xaScUM', 350, 360),
    ('rm3BYJa5z1s', 175, 180)
  )
    AND (
      s.teaching_summary ILIKE '%fourth finger%'
      OR s.teaching_summary ILIKE '%intonation%'
      OR s.segment_title ILIKE '%Fourth Finger%'
      OR s.segment_title ILIKE '%Intonation%'
    );

  IF bad_count <> 0 THEN
    RAISE EXCEPTION '016 aborted: % music-only row(s) still have narrow technique framing', bad_count;
  END IF;
END $$;

COMMIT;

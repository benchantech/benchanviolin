-- 013_fix_tan_dun_part1_duration_and_ricochet_tail.sql
-- The source transcript filename 0f6n1HMHI6g__chunk_0003__000600-000801
-- encodes HHMMSS-style bounds: 6:00-8:01, not 600-801 seconds.
-- The final reviewed ricochet rows inherited the bad integer duration and
-- one segment extended past the real video/transcript end.

BEGIN;

DO $$
DECLARE
  video_uuid uuid;
  updated_count integer;
  deleted_count integer;
  ease_segment_uuid uuid;
BEGIN
  SELECT id INTO video_uuid
  FROM public.videos
  WHERE youtube_video_id = '0f6n1HMHI6g';

  IF video_uuid IS NULL THEN
    RAISE EXCEPTION '013 aborted: expected Tan Dun part 1 video 0f6n1HMHI6g';
  END IF;

  UPDATE public.videos
  SET duration_seconds = 481
  WHERE id = video_uuid
    AND duration_seconds = 801;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 AND NOT EXISTS (
    SELECT 1 FROM public.videos WHERE id = video_uuid AND duration_seconds = 481
  ) THEN
    RAISE EXCEPTION '013 aborted: Tan Dun duration was neither the expected bad value 801 nor fixed value 481';
  END IF;

  UPDATE public.segments
  SET
    end_seconds = 481,
    segment_key = '0f6n1HMHI6g:460:481',
    segment_title = 'Ricochet: Ease as the Test',
    timestamp_label = '7:40-8:01',
    use_when = 'the player is over-controlling the stroke or cannot sustain it without fatigue',
    teaching_summary = 'Use ease as the test. A sustainable ricochet should feel mechanically light rather than forced.',
    problem_statement = 'the stroke works briefly but depends on over-control or effort',
    common_failure_mode = 'forcing the rebound until the arm tires',
    suggested_experiment = 'Repeat a small ricochet and stop when ease disappears; restart with less grip and less effort.',
    reflection_prompt = 'Could you repeat the motion many times without fatigue?',
    notes = 'Corrected after transcript audit: chunk filename end 000801 means 8:01, and source text at 7:40-8:01 is the ease-test conclusion.'
  WHERE video_id = video_uuid
    AND start_seconds = 460
    AND end_seconds = 491
    AND transcript_source_file = '0f6n1HMHI6g__chunk_0003__000600-000801.json';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0
    AND EXISTS (
      SELECT 1
      FROM public.segments
      WHERE video_id = video_uuid
        AND start_seconds = 460
        AND end_seconds = 491
        AND transcript_source_file = '0f6n1HMHI6g__chunk_0003__000600-000801.json'
    )
    AND NOT EXISTS (
    SELECT 1
    FROM public.segments
    WHERE video_id = video_uuid
      AND start_seconds = 460
      AND end_seconds = 481
      AND segment_title = 'Ricochet: Ease as the Test'
  ) THEN
    RAISE EXCEPTION '013 aborted: expected to update the Tan Dun 460-491 ricochet tail segment';
  END IF;

  SELECT id INTO ease_segment_uuid
  FROM public.segments
  WHERE video_id = video_uuid
    AND start_seconds = 460
    AND end_seconds = 481
    AND segment_title = 'Ricochet: Ease as the Test';

  IF ease_segment_uuid IS NOT NULL THEN
    DELETE FROM public.segment_tags
    WHERE segment_id = ease_segment_uuid;

    INSERT INTO public.segment_tags (segment_id, tag_id, relevance, is_primary, assigned_by)
    SELECT ease_segment_uuid, t.id, tag_data.relevance, tag_data.is_primary, 'manual_review'
    FROM (
      VALUES
        ('ricochet', 95, true),
        ('bow-relaxation', 90, false),
        ('arm-weight', 85, false)
    ) AS tag_data(slug, relevance, is_primary)
    JOIN public.tags t ON t.slug = tag_data.slug
    ON CONFLICT (segment_id, tag_id) DO UPDATE SET
      relevance = EXCLUDED.relevance,
      is_primary = EXCLUDED.is_primary,
      assigned_by = EXCLUDED.assigned_by;
  END IF;

  DELETE FROM public.segment_tags st
  USING public.segments s
  WHERE st.segment_id = s.id
    AND s.video_id = video_uuid
    AND s.start_seconds = 491
    AND s.end_seconds = 506
    AND s.transcript_source_file = '0f6n1HMHI6g__chunk_0003__000600-000801.json';

  DELETE FROM public.segments
  WHERE video_id = video_uuid
    AND start_seconds = 491
    AND end_seconds = 506
    AND transcript_source_file = '0f6n1HMHI6g__chunk_0003__000600-000801.json';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count = 0 AND EXISTS (
    SELECT 1
    FROM public.segments
    WHERE video_id = video_uuid
      AND start_seconds = 491
      AND end_seconds = 506
      AND transcript_source_file = '0f6n1HMHI6g__chunk_0003__000600-000801.json'
  ) THEN
    RAISE EXCEPTION '013 aborted: invalid Tan Dun 491-506 segment still exists';
  END IF;
END $$;

DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM public.segments s
  JOIN public.videos v ON v.id = s.video_id
  WHERE v.youtube_video_id = '0f6n1HMHI6g'
    AND s.end_seconds > v.duration_seconds;

  IF invalid_count <> 0 THEN
    RAISE EXCEPTION '013 aborted: % Tan Dun segment(s) still exceed video duration', invalid_count;
  END IF;
END $$;

COMMIT;

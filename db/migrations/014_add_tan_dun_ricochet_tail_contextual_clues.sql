-- 014_add_tan_dun_ricochet_tail_contextual_clues.sql
-- Adds direct transcript context for the corrected Tan Dun ricochet tail.

BEGIN;

WITH target AS (
  SELECT s.id
  FROM public.segments s
  JOIN public.videos v ON v.id = s.video_id
  WHERE v.youtube_video_id = '0f6n1HMHI6g'
    AND s.start_seconds = 460
    AND s.end_seconds = 481
    AND s.segment_title = 'Ricochet: Ease as the Test'
)
UPDATE public.segments s
SET contextual_clues = ARRAY[
  'On the G string, it should be pretty easy, because you''re pretty much vertical.',
  'You should be able to do this for hours. I''m not suggesting that you do that, but it should be so easy.'
]::text[]
FROM target
WHERE s.id = target.id;

DO $$
DECLARE
  matched_count integer;
BEGIN
  SELECT count(*) INTO matched_count
  FROM public.segments s
  JOIN public.videos v ON v.id = s.video_id
  WHERE v.youtube_video_id = '0f6n1HMHI6g'
    AND s.start_seconds = 460
    AND s.end_seconds = 481
    AND s.contextual_clues = ARRAY[
      'On the G string, it should be pretty easy, because you''re pretty much vertical.',
      'You should be able to do this for hours. I''m not suggesting that you do that, but it should be so easy.'
    ]::text[];

  IF matched_count <> 1 THEN
    RAISE EXCEPTION '014 aborted: expected exactly one corrected Tan Dun ricochet tail row, found %', matched_count;
  END IF;
END $$;

COMMIT;

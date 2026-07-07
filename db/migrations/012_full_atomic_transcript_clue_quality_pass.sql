-- 20260707_05_full_transcript_clue_quality_pass.sql
--
-- Full conservative pass over exported contextual transcript clues.
-- Each DO block is one atomic video-level update. It updates only the exact
-- video/timestamp/clue pairs listed, and it is safe to re-run.
-- No category, title, summary, tag, or timestamp values are changed.

-- Video: opNpw5mOowo (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (108, 132, 'One good way to start this piece, because it''s so exposed, you''re going to be probably a little bit nervous coming in, so I would recommend first getting rid of all your carbon', 'One good way to start this piece, because it''s so exposed, you''re probably going to be a little nervous coming in, so I would recommend first getting rid of your carbon dioxide.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'opNpw5mOowo'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'opNpw5mOowo'
      AND ('One good way to start this piece, because it''s so exposed, you''re probably going to be a little nervous coming in, so I would recommend first getting rid of your carbon dioxide.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video opNpw5mOowo';
  END IF;
END $$;

-- Video: QJL4rdBYbts (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (111, 125, 'Let''s give an example of you''re nervous, you''re on stage, you''ve got a little bit of stage right and what''s the first thing to go?', 'Let''s give an example: you''re nervous, you''re on stage, you''ve got a little bit of stage fright, and what''s the first thing to go?')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'QJL4rdBYbts'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'QJL4rdBYbts'
      AND ('Let''s give an example: you''re nervous, you''re on stage, you''ve got a little bit of stage fright, and what''s the first thing to go?' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video QJL4rdBYbts';
  END IF;
END $$;

-- Video: 517uzXPQ3xg (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (274, 317, 'Far, up to measure six, I''ve been playing', 'So far, up to measure six, I''ve been playing')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = '517uzXPQ3xg'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = '517uzXPQ3xg'
      AND ('So far, up to measure six, I''ve been playing' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video 517uzXPQ3xg';
  END IF;
END $$;

-- Video: 1R8WiILKtJs (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (19, 67, 'Use but Let''s see if this helps at all So let''s think of a couple of passages where there are double stops for instance in the Mendelssohn ballet concerto that second page where', 'But let''s see if this helps at all. Let''s think of a couple of passages where there are double stops, for instance in the Mendelssohn Violin Concerto, that second page where')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = '1R8WiILKtJs'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = '1R8WiILKtJs'
      AND ('But let''s see if this helps at all. Let''s think of a couple of passages where there are double stops, for instance in the Mendelssohn Violin Concerto, that second page where' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video 1R8WiILKtJs';
  END IF;
END $$;

-- Video: Fic0zak8K5Y (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (79, 117, 'The opening, before you come in, the orchestra has these moving triple eighth notes and quarter notes, and then, right before, you have a rest, bend.', 'The opening, before you come in, the orchestra has these moving triplet eighth notes and quarter notes, and then, right before you enter, you have a rest.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'Fic0zak8K5Y'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'Fic0zak8K5Y'
      AND ('The opening, before you come in, the orchestra has these moving triplet eighth notes and quarter notes, and then, right before you enter, you have a rest.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video Fic0zak8K5Y';
  END IF;
END $$;

-- Video: E66s-OJI0m0 (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (81, 105, 'Make sure you get it on properly and to make sure that the sound post is still standing because it''s possible that during shipping you can fall.', 'Make sure you get it on properly, and make sure that the soundpost is still standing, because it is possible that it can fall during shipping.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'E66s-OJI0m0'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'E66s-OJI0m0'
      AND ('Make sure you get it on properly, and make sure that the soundpost is still standing, because it is possible that it can fall during shipping.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video E66s-OJI0m0';
  END IF;
END $$;

-- Video: ewKUCf-ANlo (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (169, 178, 'Either scratch the sound or it gets a little The sound gets distorted and also it''s possible that your intonation kit can get distorted if you push too hard', 'Either you scratch the sound or it gets a little distorted, and it is also possible that your intonation can get distorted if you push too hard.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'ewKUCf-ANlo'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'ewKUCf-ANlo'
      AND ('Either you scratch the sound or it gets a little distorted, and it is also possible that your intonation can get distorted if you push too hard.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video ewKUCf-ANlo';
  END IF;
END $$;

-- Video: F3DjMch3ex0 (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (364, 397, 'On the second part, you can think of this as another big Rambo made up of two sub-Rainbows, sub-phrases, and that first phrase, instead of just playing those notes flatly along', 'On the second part, you can think of this as another big rainbow made up of two sub-rainbows—sub-phrases—and that first phrase, instead of just playing those notes flatly along')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'F3DjMch3ex0'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'F3DjMch3ex0'
      AND ('On the second part, you can think of this as another big rainbow made up of two sub-rainbows—sub-phrases—and that first phrase, instead of just playing those notes flatly along' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video F3DjMch3ex0';
  END IF;
END $$;

-- Video: NZVSQRzo48o (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (62, 73, 'One of them is that you''re like, an entire section of violins is like this row belt where everybody is chained together.', 'One of them is that an entire section of violins is like this rowboat where everybody is chained together.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'NZVSQRzo48o'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'NZVSQRzo48o'
      AND ('One of them is that an entire section of violins is like this rowboat where everybody is chained together.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video NZVSQRzo48o';
  END IF;
END $$;

-- Video: kk6xaUwKCwg (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (0, 14, '"up-oh staccato" is a pretty tricky technique, and so I''m going to try to show you how I practice.', '"Up-bow staccato" is a pretty tricky technique, and so I''m going to try to show you how I practice.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'kk6xaUwKCwg'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'kk6xaUwKCwg'
      AND ('"Up-bow staccato" is a pretty tricky technique, and so I''m going to try to show you how I practice.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video kk6xaUwKCwg';
  END IF;
END $$;

-- Video: KAiPJsuDM50 (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (116, 169, 'I find it very lightly with your fourth finger and then speed it up a little bit.', 'Find it very lightly with your fourth finger, then speed it up a little bit.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'KAiPJsuDM50'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'KAiPJsuDM50'
      AND ('Find it very lightly with your fourth finger, then speed it up a little bit.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video KAiPJsuDM50';
  END IF;
END $$;

-- Video: wLTDCW5Rv8o (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (9, 31, 'One is making sure that you don''t clamp down with your neck when you''re vibratoing.', 'One is making sure that you don''t clamp down with your neck when you''re using vibrato.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'wLTDCW5Rv8o'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'wLTDCW5Rv8o'
      AND ('One is making sure that you don''t clamp down with your neck when you''re using vibrato.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video wLTDCW5Rv8o';
  END IF;
END $$;

-- Video: MKr5VVrQIWQ (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (0, 33, 'My bow, because it''s by it''s a la fleur style, which is a little bit more of a, I guess, kind of baroque', 'My bow, because it''s a LaFleur-style bow, is a little bit more, I guess, kind of Baroque.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'MKr5VVrQIWQ'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'MKr5VVrQIWQ'
      AND ('My bow, because it''s a LaFleur-style bow, is a little bit more, I guess, kind of Baroque.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video MKr5VVrQIWQ';
  END IF;
END $$;

-- Video: tHVk9XfXUC4 (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (0, 32, 'This is quadruple stops requested by zero star 36 and I have a video on triple stops if you''re curious and those triple stops I play just in one', 'This is quadruple stops, requested by 0star36, and I have a video on triple stops if you''re curious. Those triple stops I play just in one')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = 'tHVk9XfXUC4'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = 'tHVk9XfXUC4'
      AND ('This is quadruple stops, requested by 0star36, and I have a video on triple stops if you''re curious. Those triple stops I play just in one' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video tHVk9XfXUC4';
  END IF;
END $$;

-- Video: 1FN_xHL-u-Q (1 correction)
DO $$
DECLARE
  changed_count integer;
BEGIN
  WITH fixes(start_seconds, end_seconds, old_clue, new_clue) AS (
    VALUES
      (110, 137, 'Even when you''re not nervous I have I guess from my mom a hyperthyroid and so I don''t know if what that is but basically my metabolism is super fast.', 'Even when you''re not nervous, I have, I guess from my mom, hyperthyroidism, so my metabolism is super fast.')
  ),
  matched AS (
    SELECT s.id, f.old_clue, f.new_clue
    FROM fixes f
    JOIN public.videos v ON v.youtube_video_id = '1FN_xHL-u-Q'
    JOIN public.segments s
      ON s.video_id = v.id
     AND s.start_seconds = f.start_seconds
     AND s.end_seconds = f.end_seconds
    WHERE f.old_clue = ANY(s.contextual_clues)
  )
  UPDATE public.segments s
  SET contextual_clues = array_replace(s.contextual_clues, matched.old_clue, matched.new_clue)
  FROM matched
  WHERE s.id = matched.id;

  GET DIAGNOSTICS changed_count = ROW_COUNT;

  -- Idempotency: zero rows is valid only after every replacement is already present.
  IF changed_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.videos v
    JOIN public.segments s ON s.video_id = v.id
    WHERE v.youtube_video_id = '1FN_xHL-u-Q'
      AND ('Even when you''re not nervous, I have, I guess from my mom, hyperthyroidism, so my metabolism is super fast.' = ANY(s.contextual_clues))
  ) THEN
    RAISE EXCEPTION 'Transcript-clue repair could not find expected target(s) for video 1FN_xHL-u-Q';
  END IF;
END $$;

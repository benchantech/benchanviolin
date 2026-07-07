-- 023_semantic_drift_cleanup_batch_7.sql
-- Conservative semantic cleanup for high-confidence ai_proposed drift rows.
-- Keeps rows unpublished; improves title/use/summary/tags from direct transcript clues.

BEGIN;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      ('Cu2dnhlKft0', 0, 25, 'Practice Night: Camera Feedback', 'the player is restarting regular practice and using video review for feedback', 'The clue says Thursday night will become practice/YouTube night and that the player will watch the footage back to improve. This is a self-review practice setup, not vibrato technique.', 'practice lacks a feedback loop outside the moment of playing', 'playing through without watching back or naming what changed', 'Record one short practice pass, watch it back, and name one thing to improve next time.', 'What did the video reveal that playing alone did not?', ARRAY['practice-strategy']::text[]),
      ('CvWVNMybMeQ', 20, 68, 'Practice Time: Quality Over Four-Hour Quota', 'the player is reflecting on practice quantity versus useful practice feedback', 'The clue references being told to practice four hours every day. Frame the segment as practice planning: time matters less than what the work is measuring.', 'practice time becomes a quota instead of useful work', 'counting hours without choosing a specific practice target', 'Choose one target for the next ten minutes before worrying about total practice time.', 'Was the practice measured by improvement or by hours?', ARRAY['practice-strategy']::text[]),
      ('F3DjMch3ex0', 364, 397, 'Phrasing: Big Rainbow and Sub-Phrases', 'the player is shaping a second part as a large phrase made of smaller phrase arcs', 'The clue describes a big rainbow made of two sub-rainbows or sub-phrases, instead of playing notes flatly. Treat this as phrasing and musical shape.', 'the phrase sounds flat because the sub-phrases are not shaped', 'playing the notes evenly without hearing the larger arc', 'Mark the two sub-phrases, then play them as parts of one larger rainbow.', 'Did the small arcs still belong to one big phrase?', ARRAY['performance-context','bow-speed']::text[]),
      ('Fic0zak8K5Y', 79, 117, 'Orchestral Entrance: Hear the Triplets Before Coming In', 'the player is using the orchestra texture and rest before the entrance as a cue', 'The clue says the orchestra has moving triplet eighths and quarter notes before a rest and entrance. Use the texture as an ensemble cue instead of treating the excerpt as basic intonation.', 'the entrance is insecure because the orchestral cue is not heard', 'counting only internally and ignoring the texture before the entrance', 'Listen for the moving triplets, feel the rest, then enter from that cue.', 'Could you hear the orchestra cue before entering?', ARRAY['orchestral-balance','performance-context']::text[]),
      ('G3MAdfyihhw', 164, 179, 'Overlap Groups by One Note', 'the player is practicing by overlapping groups with one shared note', 'The clue says to overlap each group by one note. Use overlapping groups to connect small chunks without losing continuity.', 'small practice groups do not connect into a continuous passage', 'starting each group separately with no shared anchor note', 'Practice four-note groups where each new group repeats the last note of the previous group.', 'Did the overlap make the groups connect?', ARRAY['practice-strategy']::text[]),
      ('G3MAdfyihhw', 185, 231, 'First Position Unless the Piece Requires More', 'the player is choosing to stay in first position unless a higher note requires shifting', 'The clue says everything looks playable in first position unless a higher note requires going up. Treat this as a conservative fingering and position-choice plan.', 'the player shifts more than the passage actually requires', 'assuming a position change before testing first position', 'Play the phrase in first position, then shift only for notes that cannot be reached cleanly.', 'Did first position cover the passage reliably?', ARRAY['shifting','practice-strategy']::text[]),
      ('G3MAdfyihhw', 294, 312, 'First-Position Fingering Check', 'the player is confirming whether the piece can stay in first position', 'The clue repeats that the piece appears playable in first position unless a higher note forces a shift. Use this as a fingering check rather than isolated fourth-finger work.', 'the fingering plan is unclear because position choices are not tested', 'defaulting to a harder fingering before checking first position', 'Map the notes in first position and circle only the notes that require a shift.', 'Which notes actually require leaving first position?', ARRAY['shifting','practice-strategy']::text[]),
      ('Hk97yKXBHVw', 77, 96, 'Body Rib as Shift Reference', 'the player is using the violin body or rib as a physical reference point for a high position', 'The clue says not to think of it as much of a shift, but as placing the hand where the body or rib is. Use the instrument body as a tactile reference.', 'the high position feels vague because there is no physical reference', 'aiming only by distance instead of using the violin body as a landmark', 'Place the hand at the body/rib reference, then check the target pitch.', 'Did the body reference make the shift easier to locate?', ARRAY['shifting','practice-strategy']::text[]),
      ('Hk97yKXBHVw', 180, 227, 'Slide Plus Jump: Combine the Two Motions', 'the player is combining a slide with a later jump in a distinct passage occurrence', 'The clue says the part jumps up and combines the slide with another motion. Practice the slide and jump as two named components before reconnecting them.', 'the passage feels like one vague difficult move', 'trying to solve the slide and jump at the same time', 'Practice the slide alone, the jump alone, then reconnect them in rhythm.', 'Could you identify both motions in the combined passage?', ARRAY['shifting','practice-strategy']::text[]),
      ('IDny7YYxobE', 208, 240, 'Expressive Intonation: Bend the Pitch Lower', 'the player is explaining how violinists can bend pitch for minor color beyond equal temperament', 'The clue contrasts equal temperament with bending the pitch lower to sound more minor. Treat this as expressive intonation, not generic pitch correction.', 'the phrase loses color because all pitches are treated as equal-tempered', 'lowering pitch randomly instead of tying it to minor color', 'Play the note at equal temperament, then bend it slightly lower and compare the color.', 'Did the lower pitch make the harmony sound more minor?', ARRAY['intonation','performance-context']::text[]),
      ('IL4cmuWiQUk', 217, 238, 'After It Feels Easy: Think Musicality', 'the player is moving from technical ease into musical shaping', 'The clue says the passage is easy now, so the next thought is musicality. Frame the segment as the transition from mechanics to expression.', 'technical success does not yet become musical expression', 'stopping once the notes feel easy instead of shaping the phrase', 'Play once for ease, then once with one clear musical choice.', 'What changed when musicality became the target?', ARRAY['performance-context','practice-strategy']::text[]),
      ('IZhlanwZPS8', 560, 590, 'Slow Practice for Classical Predictability', 'the player is emphasizing slow practice even when the notes feel easy to predict', 'The clue says to practice slowly, then notes the classical nature makes the notes easier to anticipate. Slow work should confirm what the ear expects.', 'predictable notes are played too casually to check accuracy', 'relying on ear and perfect pitch instead of slow confirmation', 'Play the passage slowly enough to confirm each expected note before speeding up.', 'Did slow practice confirm the notes you expected?', ARRAY['practice-strategy','intonation']::text[]),
      ('MC71NLSy3Dg', 442, 485, 'Advanced Intonation: Check With a Teacher', 'the player is treating pitch-color work as an advanced technique that needs outside feedback', 'The clue says this is very advanced and that a teacher should confirm it sounds the way it should. Keep the experiment supervised and sound-based.', 'advanced pitch color is applied without feedback', 'assuming the inflection is correct because it is intentional', 'Record the pitch-color version and compare it with teacher or trusted feedback.', 'Does the pitch color sound musical to another listener?', ARRAY['intonation','performance-context','practice-strategy']::text[]),
      ('P9A8mVGjERE', 178, 180, 'String Crossing: Arm Height Check', 'the player notices the arm is not high enough for the crossing', 'The clue says the arm is not high enough. The actionable issue is arm level for string crossing, not generic practice strategy.', 'the bow misses the clean string level because the arm is too low', 'trying to fix the crossing with the wrist instead of raising the arm level', 'Raise the arm to the correct string level before playing the crossing.', 'Did the arm height match the target string?', ARRAY['string-crossing','practice-strategy']::text[]),
      ('S-xMtLyNw1w', 207, 262, 'Vibrato: Elbow Motion Lets the Finger Collapse Naturally', 'the player is using horizontal elbow motion so the finger and pinky collapse naturally without pushing', 'The clue says not to push the finger or pinky down; bringing the elbow over makes the finger naturally collapse. Use elbow motion to create relaxed vibrato mechanics.', 'the finger tires because it is pushed down manually', 'forcing the finger joint instead of moving the elbow horizontally', 'Move the elbow horizontally and let the finger respond without pressing.', 'Did the finger move because of the elbow rather than pressure?', ARRAY['vibrato','fourth-finger','practice-strategy']::text[]),
      ('VghtMPTKvuI', 60, 76, 'Bow Contact: Weight Added to the String', 'the player is explaining how bow contact adds weight to the string', 'The clue says contacting the string with the bow adds weight. Frame this as bow contact and arm weight rather than shifting.', 'the sound changes because bow weight is not understood', 'thinking only about left-hand travel while the bow is controlling contact', 'Set the bow on the string and notice how much weight enters before moving.', 'Could you feel the bow weight before the stroke?', ARRAY['arm-weight','sounding-point']::text[]),
      ('VghtMPTKvuI', 349, 362, 'Left Hand: Collapsed Wrist Check', 'the player is identifying a collapsed left wrist when placing fingers', 'The clue says the wrist collapses or falls down when putting fingers down. Treat this as left-hand setup rather than a shift.', 'the left wrist collapses while the fingers are placed', 'placing fingers without noticing the wrist falling', 'Place each finger while watching whether the wrist stays supported.', 'Did the wrist stay up as the fingers landed?', ARRAY['practice-strategy','intonation']::text[]),
      ('Vz3hsk-jnsk', 54, 70, 'First Layer: In Tune and In Rhythm', 'the player is building a first layer of correct notes and rhythm before adding musicality', 'The clue says first play all notes in tune and in rhythm, then move to the second layer of musicality. Keep the first layer clear before expression.', 'musicality is added before notes and rhythm are stable', 'skipping the foundational pass and trying to shape too soon', 'Play once only for intonation and rhythm, then add one musical layer.', 'Was the first layer stable before musicality?', ARRAY['intonation','practice-strategy','performance-context']::text[]),
      ('jrzuLv0ZT0w', 31, 69, 'Raise the Pitch With More Finger Flesh', 'the player is adjusting finger contact on the D string to raise the pitch', 'The clue says to get more finger flesh on the D string to raise that pitch. Use contact shape as the intonation adjustment.', 'the pitch sits low because finger contact is too narrow or misplaced', 'sliding the whole hand instead of changing finger flesh on the string', 'Place the finger with more pad on the D string and listen for the pitch rise.', 'Did more finger flesh raise the pitch cleanly?', ARRAY['intonation','practice-strategy']::text[]),
      ('jrzuLv0ZT0w', 110, 130, 'Relaxed Landing: Teach the Hand Where to Go', 'the player is teaching the hand to land from a relaxed position', 'The clue says the second part teaches the hand where to land from relaxed position. Practice the landing as a relaxed reset and arrival.', 'the hand lands tense or uncertain from rest', 'holding the hand in place instead of learning the relaxed arrival', 'Shake out the hand, return to relaxed position, then land on the target spot.', 'Did the hand find the landing from relaxation?', ARRAY['shifting','practice-strategy']::text[]),
      ('jrzuLv0ZT0w', 146, 177, 'Finger Grooves as Practice Memory', 'the player is using the fingerboard grooves from placement to remember where the hand belongs', 'The clue says finger grooves help during practice, then asks the player to shake out and return where the hand belongs. Use tactile memory for landing.', 'the hand forgets the landing spot after resetting', 'checking only visually instead of using tactile finger memory', 'Place the finger, notice the groove, shake out, then return to the same spot.', 'Did the hand remember the spot after the shakeout?', ARRAY['practice-strategy','shifting']::text[]),
      ('jrzuLv0ZT0w', 180, 199, 'Pinky Landing: Small Forward Hand Gesture', 'the player is noting that the pinky is trickier and needs a small forward hand gesture', 'The clue says the same idea applies to other fingers, but pinky is trickiest; the hand remembers a small forward gesture. Treat pinky as an extension of the landing motion.', 'the pinky misses because the hand does not make the small forward gesture', 'reaching only with the pinky instead of moving the hand slightly', 'Practice the small forward hand gesture without sound, then add the pinky.', 'Did the small hand gesture make pinky easier?', ARRAY['fourth-finger','practice-strategy','shifting']::text[])
  ) AS f(
    youtube_video_id,start_seconds,end_seconds,segment_title,use_when,teaching_summary,
    problem_statement,common_failure_mode,suggested_experiment,reflection_prompt,tag_slugs
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
    notes = trim(coalesce(s.notes, '') || ' Semantic drift cleanup batch 7: title, summary, and tags aligned to contextual_clues.')
  FROM fixes f
  JOIN public.videos v ON v.youtube_video_id = f.youtube_video_id
  WHERE s.video_id = v.id
    AND s.start_seconds = f.start_seconds
    AND s.end_seconds = f.end_seconds
    AND s.review_status = 'ai_proposed'
    AND s.is_public = false
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
    'semantic_drift_cleanup'
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
  (SELECT count(*) FROM updated) AS updated_segments,
  (SELECT count(*) FROM inserted_tags) AS inserted_segment_tags;

COMMIT;

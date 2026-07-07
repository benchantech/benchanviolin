-- 022_semantic_drift_cleanup_batch_6.sql
-- Conservative semantic cleanup for high-confidence ai_proposed drift rows.
-- Keeps rows unpublished; improves title/use/summary/tags from direct transcript clues.

BEGIN;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      ('MC71NLSy3Dg', 97, 147, 'Scale Intonation: Raise E and B Going Up', 'the player is adding expressive pitch inflection to E and B in an ascending scale', 'The clue names the third scale note E and B, and says they are technically raised when moving up the scale. Treat this as advanced scale intonation and expressive pitch placement.', 'the scale sounds plain because expressive raised notes are not identified', 'playing E and B neutrally instead of hearing their upward tendency', 'Play the scale once normally, then raise E and B slightly on the ascent.', 'Did the raised notes add the intended color without sounding out of tune?', ARRAY['intonation','scales']::text[]),
      ('MC71NLSy3Dg', 192, 215, 'Advanced Pitch Color: Upward E and B', 'the advanced player wants to add slight upward pitch color on E and B', 'The clue says this is difficult and for advanced players, suggesting extra upward pitch on E and B in the opening. Keep the adjustment small and intentional.', 'pitch color is either absent or exaggerated', 'raising notes without first knowing which notes carry the color', 'Isolate E and B in the opening and test a very small upward inflection.', 'Did the pitch color sound intentional rather than sharp?', ARRAY['intonation','performance-context']::text[]),
      ('MC71NLSy3Dg', 283, 321, 'Opening Phrase: Experiment With Raised Pitch', 'the advanced player is experimenting with raised pitch in the opening phrase', 'The clue invites advanced players to experiment with extra upward pitch. Frame this as optional expressive intonation rather than basic correction.', 'the expressive pitch idea is applied as a fixed rule instead of an experiment', 'changing pitch before checking whether it improves the phrase', 'Play the phrase with and without the upward pitch, then compare the musical effect.', 'Which version sounds more convincing?', ARRAY['intonation','performance-context']::text[]),
      ('MC71NLSy3Dg', 346, 361, 'Minor Color: Drop the Pitch After the Raised Entrance', 'the player is changing pitch color when the phrase turns minor', 'The clue says the entrance is a little raised, but then the phrase comes out minor and the pitch drops. Use intonation color to mark the harmonic change.', 'the second phrase keeps the same pitch color after the harmony changes', 'raising everything instead of responding to the minor turn', 'Play the entrance slightly raised, then deliberately drop the color when it turns minor.', 'Did the intonation show the minor color?', ARRAY['intonation','performance-context']::text[]),
      ('MKr5VVrQIWQ', 152, 181, 'Relaxed Hand: Pinky Can Come Off', 'the player is observing how a relaxed left hand lets the pinky release naturally', 'The clue points to Perlman and says the hand is relaxed enough that the pinky can come right off. Treat the pinky as evidence of relaxation, not a forced fourth-finger action.', 'the pinky stays tense because the hand is over-controlled', 'holding every finger down instead of letting unused fingers release', 'Play slowly and let the pinky release when it is not needed.', 'Did the pinky release without disturbing the hand?', ARRAY['fourth-finger','practice-strategy']::text[]),
      ('MKr5VVrQIWQ', 252, 303, 'Flat Bow Hair Against the String', 'the player is using flatter bow hair as a helper for sound and control', 'The clue says putting the bow hair flat against the string helps. Frame the task as bow contact setup rather than shifting.', 'the sound lacks stability because bow contact is not set', 'changing left-hand choices while ignoring bow hair contact', 'Play the same note with tilted hair and flatter hair, then keep the steadier contact.', 'Did flatter bow hair stabilize the sound?', ARRAY['sounding-point','bow-relaxation']::text[]),
      ('MRtvUvg5Afs', 99, 125, 'Contact Point: Bow Down at the Right Place', 'the player is finding a contact point where the bow works without extra effort', 'The clue says the pinky may come off from relaxation, then shifts to putting the bow down at the right contact point. The main task is contact point and relaxed bow placement.', 'the bow does not speak cleanly because the contact point is vague', 'pressing or adjusting fingers before finding where the bow belongs', 'Set the bow at one contact point, play, then adjust until the sound speaks easily.', 'Did the contact point make the bow feel easy?', ARRAY['sounding-point','bow-relaxation']::text[]),
      ('Qa1Zj_L3x8c', 349, 360, 'Double Stops: More Bow at the Beginning', 'the player is shaping double stops with more bow at the start and less at the end', 'The clue says to use more bow at the beginning of the stroke and less at the end, applying it to double stops. Use bow distribution to control the double-stop phrase.', 'the double stop phrase has uneven bow distribution', 'using the same amount of bow throughout the stroke', 'Play the double stop with extra bow at the start, then taper the bow toward the end.', 'Did the bow distribution shape the double stop?', ARRAY['double-stops','bow-speed','performance-context']::text[]),
      ('Qa1Zj_L3x8c', 368, 397, 'Musicality: Up-Bow Bow Amount', 'the player is connecting musicality to the amount of bow used on an up bow', 'The clue says musicality begins once the bow feeling and right amount of bow are available, specifically when starting an up bow. Make bow amount the musical variable.', 'musicality is attempted before bow amount is under control', 'adding expression without deciding how much bow the up bow needs', 'Start the up bow three times with different bow amounts and keep the most musical one.', 'Did the bow amount support the phrase?', ARRAY['bow-speed','performance-context','practice-strategy']::text[]),
      ('Qa1Zj_L3x8c', 595, 607, 'Phrase Rainbow: Lift the Next Phrase Higher', 'the player is shaping connected phrases as rising rainbow levels', 'The clue says the phrase starts at the lowest point of the rainbow, then the next phrase rises to another level. Treat this as phrase shape and musical pacing.', 'the phrases stay flat instead of building in levels', 'playing each phrase with the same energy and height', 'Play the first phrase low and grounded, then lift the second phrase to a higher level.', 'Did the second phrase rise from the first?', ARRAY['performance-context','bow-speed']::text[]),
      ('Qs-tFga-tVg', 35, 70, 'Speed Practice: Increase Very Slowly', 'the player is building fast playing by starting very slowly and increasing speed gradually', 'The clue says the key to playing quickly is practicing very slowly first, then increasing speed very slowly. Keep tempo growth incremental.', 'speed is added before the motion is reliable', 'jumping to tempo instead of building it in small steps', 'Start slow enough to play cleanly, then raise the metronome one small step at a time.', 'Did each speed increase preserve clarity?', ARRAY['practice-strategy']::text[]),
      ('Qs-tFga-tVg', 99, 126, 'String Crossing: Arm Movement, Not Wrist Force', 'the player is crossing strings with arm movement instead of forcing from the wrist', 'The clue says string crossing requires the arm to move, and forcing it with the wrist creates a bad sound. Use arm level as the primary crossing mechanism.', 'the crossing sounds bad because the wrist is forcing the change', 'trying to cross strings with wrist motion alone', 'Move the arm level between strings while keeping the wrist quiet and flexible.', 'Did the arm create the crossing without wrist force?', ARRAY['string-crossing','bow-relaxation']::text[]),
      ('Qs-tFga-tVg', 185, 237, 'Masked Shift: A-String Cover and Bow Accents', 'the player is using bow accents and the A string to mask a shift into third position', 'The clue says to make non-crossings sound like string crossings with tiny bow accents, then use the A string to mask the shift to third position. Coordinate sound disguise and position change.', 'the shift into third position is too audible', 'shifting without using the A-string cover and bow accents', 'Add tiny bow accents, then shift to third position while the A string masks the move.', 'Did the listener hear the line instead of the shift?', ARRAY['shifting','string-crossing','bow-changes']::text[]),
      ('Qs-tFga-tVg', 208, 256, 'Minor Scale Ending: Hit the A and Shift to Third', 'the player is tuning the A and using third position in the final minor scale', 'The clue says to hit the A right on because it is easy to hear if it is out of tune, then move to C-sharp in third position for the last minor scale. Mark the A as the checkpoint.', 'the final scale goes out of tune around the audible A', 'running through the scale without checking the A target', 'Stop on the A, confirm it is in tune, then continue into the third-position C-sharp.', 'Did the A checkpoint stabilize the scale?', ARRAY['scales','intonation','shifting']::text[]),
      ('Rpmg27DcOoU', 0, 15, 'Fourth Finger: Keep It Round', 'the player is addressing a collapsing fourth finger by keeping it round', 'The clue directly introduces keeping fourth finger round instead of letting it collapse. The segment should be framed as pinky curvature and joint support.', 'fourth finger collapses instead of staying round', 'pressing the pinky down without maintaining the curved shape', 'Place fourth finger slowly and stop before the first joint collapses.', 'Did the fourth finger stay round?', ARRAY['fourth-finger','practice-strategy']::text[]),
      ('Rpmg27DcOoU', 61, 112, 'Elbow Under for Rounder Fingers', 'the player is using elbow position to make the fingers rounder', 'The clue says bringing the elbow under makes the fingers rounder and changes hand position. Use elbow placement to support the fourth finger and hand shape.', 'fingers collapse because the elbow is not supporting the hand position', 'trying to fix the fingertip without moving the elbow', 'Bring the elbow slightly under the violin, then place the fingers and check their curve.', 'Did the elbow position make the fingers rounder?', ARRAY['fourth-finger','shifting','practice-strategy']::text[]),
      ('Rpmg27DcOoU', 112, 167, 'Fourth Finger: Free Wiggle Motion', 'the player is finding a hand setup where the fourth finger can wiggle freely', 'The clue says the goal is a motion where the finger can wiggle freely rather than fighting physical impediments. Find the hand position that lets pinky motion release.', 'fourth finger motion is blocked by the hand setup', 'forcing the pinky while the hand position restricts it', 'Adjust elbow and hand until the fourth finger can wiggle without strain.', 'Could the pinky move freely before playing?', ARRAY['fourth-finger','practice-strategy']::text[]),
      ('Rpmg27DcOoU', 144, 173, 'Fourth Finger: Elbow Awareness', 'the player is using elbow placement under the violin to help fourth finger', 'The clue says to be aware of where the elbow is underneath the violin when going for fourth finger. Make elbow location the setup variable.', 'fourth finger misses because elbow placement is ignored', 'reaching with the pinky before setting the elbow under the instrument', 'Place the elbow under the violin, then drop fourth finger without stretching.', 'Did elbow placement make fourth finger easier?', ARRAY['fourth-finger','practice-strategy']::text[]),
      ('Rpmg27DcOoU', 194, 245, 'Collapsed Knuckle Blocks Vibrato', 'the player is preventing first-knuckle collapse so vibrato action can work', 'The clue says if the first knuckle collapses, vibrato action cannot work. Keep the finger structure supported enough for vibrato to move.', 'vibrato is blocked by a collapsed first knuckle', 'pressing down until the joint folds inside out', 'Place the finger with a supported first knuckle, then test a small vibrato motion.', 'Did the knuckle stay supported enough to vibrate?', ARRAY['fourth-finger','vibrato']::text[]),
      ('Rpmg27DcOoU', 242, 286, 'Pinky Shape: Avoid Inside-Out Collapse', 'the player is correcting the pinky shape when the first knuckle collapses but the second does not', 'The clue describes the pinky looking collapsed inside out. Treat this as fourth-finger joint shape and setup, not generic shifting.', 'the pinky collapses into an inside-out shape', 'placing fourth finger without checking the first and second knuckles', 'Place pinky slowly and stop if the first knuckle collapses inside out.', 'Did the pinky keep a usable shape?', ARRAY['fourth-finger','vibrato','practice-strategy']::text[])
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
    notes = trim(coalesce(s.notes, '') || ' Semantic drift cleanup batch 6: title, summary, and tags aligned to contextual_clues.')
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

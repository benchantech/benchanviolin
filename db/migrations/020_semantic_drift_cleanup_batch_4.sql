-- 020_semantic_drift_cleanup_batch_4.sql
-- Conservative semantic cleanup for high-confidence ai_proposed drift rows.
-- Keeps rows unpublished; improves title/use/summary/tags from direct transcript clues.

BEGIN;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      ('KAiPJsuDM50', 6, 65, 'Second Position: Relaxed Octave Hand Frame', 'the player is starting in second position and needs an octave frame that stays relaxed', 'The clue says to start in second position and get a nice octave using a relaxed hand frame. Use the octave as the first checkpoint before jumping around the excerpt.', 'the opening position is unstable because the octave frame is tense', 'placing the notes before the second-position hand frame is relaxed', 'Set first and fourth fingers as an octave in second position, then play only after the hand relaxes.', 'Did the octave confirm a relaxed second-position frame?', ARRAY['shifting','intonation']::text[]),
      ('KAiPJsuDM50', 57, 89, 'Second Position: First and Fourth Before Shifting Down', 'the player is setting first and fourth fingers in second position before shifting down', 'The clue says to stick down first and fourth fingers in second position, then shift down. Make that two-finger frame the anchor before the downward move.', 'the shift down happens before second position is anchored', 'moving down without first confirming the first-and-fourth frame', 'Place first and fourth in second position, pause, then shift down from that frame.', 'Was the downward shift launched from a clear frame?', ARRAY['shifting','intonation','fourth-finger']::text[]),
      ('KAiPJsuDM50', 116, 169, 'Light Fourth Finger Extension to E', 'the player is extending fourth finger lightly to E and then increasing speed', 'The clue says to find the note lightly with fourth finger, speed it up, and extend fourth finger out on E. Keep the pinky light before adding tempo.', 'the fourth-finger extension gets heavy or tense at speed', 'pressing hard to find E instead of touching it lightly first', 'Find E lightly with fourth finger three times, then speed up without adding pressure.', 'Did the E stay light as the tempo increased?', ARRAY['fourth-finger','intonation','practice-strategy']::text[]),
      ('KAiPJsuDM50', 193, 245, 'Fast Notes: Slurred Triplet and Sixteenths', 'the player is organizing fast notes as a slurred triplet plus sixteenths before choosing position', 'The clue splits fast notes into a triplet and four sixteenths, probably slurred, then considers first position. Frame the task as rhythmic grouping and bowing choice.', 'the fast notes feel disorganized because grouping and slur are unclear', 'choosing position before deciding the rhythm and bowing pattern', 'Clap the triplet plus four sixteenths, then play them in one slur before testing position.', 'Did the grouping make the fast notes easier to place?', ARRAY['bow-changes','practice-strategy','shifting']::text[]),
      ('KAiPJsuDM50', 231, 279, 'Slide Practice: Second to First Position', 'the player is practicing slides between second and first position until the distance is comfortable', 'The clue names shifting up to second position, back to first, and practicing slides until the spot is comfortable. Treat the slide as distance training.', 'the position distance is not physically familiar yet', 'trying to hit the final note without practicing the slide path', 'Slide second to first and back slowly until the distance feels predictable, then restore rhythm.', 'Did the slide path become comfortable before tempo returned?', ARRAY['shifting','practice-strategy']::text[]),
      ('Kobf2zvvvbk', 25, 64, 'Opening Run: Tight Pitch Map', 'the player is tuning a fast run with low B-flats and F-naturals and high C-sharps', 'The clue says to hug the notes tightly pitch-wise: B-flat low, C-sharp high, and F low. This is a specific pitch map for the run, not generic intonation.', 'the fast run sounds loose because the chromatic pitch tendencies are not mapped', 'treating every pitch as equal instead of aiming low and high notes deliberately', 'Play only B-flat, C-sharp, and F from the run, exaggerating the low-high-low map.', 'Did the run keep its tight pitch shape?', ARRAY['intonation','practice-strategy']::text[]),
      ('Kobf2zvvvbk', 106, 162, 'Third Finger Instead of Weak Pinky Vibrato', 'the player is choosing fingering based on vibrato strength at the end of the phrase', 'The clue says a 3-4 option is possible but the pinky vibrato is weaker than third finger. Choose the fingering that gives better vibrato and sound.', 'the fingering technically works but weakens the vibrato color', 'using fourth finger because it is available instead of comparing sound quality', 'Try the ending with fourth finger and third finger, then choose the stronger vibrato.', 'Which fingering produced the better vibrato color?', ARRAY['vibrato','fourth-finger','performance-context']::text[]),
      ('Kobf2zvvvbk', 126, 180, 'Slow Practice Before the 3-4 Ending', 'the player can make the passage reliable by practicing slowly before testing the 3-4 option', 'The clue says the player can get it every time by practicing slowly first, then mentions the 3-4 ending and weak pinky vibrato. Slow work should stabilize the route before choosing the ending fingering.', 'the ending is tested at tempo before the route is reliable', 'changing fingering before slow practice proves the motion', 'Practice the route slowly until it lands three times, then compare the 3-4 ending.', 'Did slow practice make the ending predictable?', ARRAY['practice-strategy','shifting','vibrato']::text[]),
      ('Kobf2zvvvbk', 329, 358, 'Bow Reset and Tight Pitch Targets', 'the player is resetting bowing while keeping C-sharps high and B-flats/Fs low', 'The clue says the bowing may be wrong, then returns to hugging C-sharps high and B-flats and Fs low. Separate bowing cleanup from the fixed pitch map.', 'bowing uncertainty distracts from the needed pitch tendencies', 'changing bowing and pitch targets at the same time', 'First mark the low/high pitch targets, then run the same notes with the corrected bowing.', 'Did the pitch map survive the bowing reset?', ARRAY['intonation','bow-changes','practice-strategy']::text[]),
      ('P9A8mVGjERE', 0, 40, 'String Crossing: Start on a Middle String', 'the player is practicing string crossings from the A string so both directions are available', 'The clue says the A string is a good starting point because a middle string lets the player cross left or right. Build the crossing practice from a balanced starting string.', 'string-crossing practice is one-sided or poorly centered', 'starting on an outer string and limiting the crossing options', 'Start on A, cross to each neighboring string, then return to A with the same arm path.', 'Did starting on A make both crossing directions clear?', ARRAY['string-crossing','practice-strategy']::text[]),
      ('PTWDtHFcwIA', 156, 183, 'First Finger Guide Beside Fourth Finger', 'the player is using first finger beside fourth finger as a guide during shifting', 'The clue says to stick it against fourth finger so the shift does not rely only on the weak pinky. Let the stronger guide finger support the fourth-finger target.', 'the shift depends too much on fourth finger alone', 'asking the pinky to find the target without a nearby guide', 'Place first finger beside fourth finger, shift with both as a guide, then release the helper.', 'Did the guide finger make the pinky target easier?', ARRAY['shifting','fourth-finger','intonation']::text[]),
      ('PTWDtHFcwIA', 180, 236, 'Weak Pinky: Use the Octave Frame', 'the player is using an octave relationship to support a weak fourth finger', 'The clue names the pinky as the weakest finger and points to an octave between strings. Use the stronger lower finger and octave frame to locate the pinky.', 'fourth finger misses because it is isolated from the hand frame', 'searching with the pinky instead of forming the octave', 'Set the lower finger, form the octave, then let fourth finger land from that frame.', 'Did the octave frame support the weak pinky?', ARRAY['fourth-finger','intonation','shifting']::text[]),
      ('PTWDtHFcwIA', 214, 256, 'Tune the Top Note to the Bottom Note', 'the player is tuning an octave by listening to the lower note first', 'The clue says the octave helps and suggests listening to the bottom note, always tuning to the bottom note. Make the lower finger the intonation reference for the top note.', 'the top note floats because the lower note is not used as a reference', 'tuning both notes independently instead of anchoring the bottom note', 'Sustain or hear the bottom note first, then place the top note against it.', 'Did the top note tune to the bottom note?', ARRAY['intonation','double-stops','practice-strategy']::text[]),
      ('QJL4rdBYbts', 4, 20, 'Shifting From the Elbow, Not Just Fingers', 'the player is learning to initiate shifts from the elbow rather than finger placement alone', 'The clue says shifting is not just moving fingers to a spot; the motion starts with the elbow. Let the elbow initiate the distance before the fingers land.', 'the shift is finger-led and becomes inaccurate', 'aiming the fingers while the arm arrives late', 'Start the motion from the elbow, then let the fingers land after the arm moves.', 'Did the elbow start the shift?', ARRAY['shifting','practice-strategy']::text[]),
      ('QJL4rdBYbts', 41, 62, 'Octave Shift: Hear the Target Before Moving', 'the player is shifting from A to the octave above and needs a clear target pitch', 'The clue describes going from A to an octave above and references hearing the pitch. Use the octave sound as the target before measuring the distance.', 'the octave shift is aimed by distance instead of sound', 'moving first and listening only after the note lands', 'Hear the upper A, initiate the shift, then check whether the octave matches.', 'Was the upper octave in the ear before the hand moved?', ARRAY['shifting','intonation']::text[]),
      ('QJL4rdBYbts', 97, 110, 'Big Shift: Make the Miss Less Likely', 'the player is preparing a large shift so the target note is not missed', 'The clue asks how to make sure the note is hit and warns that missing it sounds bad. Build the shift around a reliable physical cue before playing the target.', 'the big shift is treated as a leap and the target note is missed', 'hoping for the note without a repeatable cue', 'Mark the starting and target spots, shift silently, then play only after the hand lands.', 'Did the physical cue make the big shift reliable?', ARRAY['shifting','intonation']::text[]),
      ('QJL4rdBYbts', 161, 178, 'Big Shift: Think Small in the Arm', 'the player is reframing a large fingerboard distance as a smaller arm movement', 'The clue says a big shift should not be judged by the large finger distance, but by the smaller movement elsewhere in the body. Use the arm distance to simplify the shift.', 'the shift feels too large because the player focuses on finger distance', 'measuring the leap with the fingers instead of the arm', 'Move the arm slowly and notice how small the body motion is compared with the fingerboard distance.', 'Did the shift feel smaller when measured by the arm?', ARRAY['shifting','practice-strategy']::text[]),
      ('QJL4rdBYbts', 239, 256, 'Muscle Memory for Shift Distance', 'the player is memorizing the physical distance of the shift so it becomes automatic', 'The clue says the muscle remembers the distance even without conscious thought, and shifting improves by focusing on that memory. Train the body distance directly.', 'the shift depends on conscious aiming every time', 'recalculating the target instead of repeating the same body distance', 'Repeat the same silent shift five times, then play it once without looking.', 'Did the body remember the distance?', ARRAY['shifting','practice-strategy']::text[]),
      ('QJL4rdBYbts', 287, 317, 'Feel the Muscle Distance', 'the player is learning the shift by feeling how much the muscle moves', 'The clue says the player is figuring out by feel how much the muscle moves, and then memorizing that small amount. Make tactile distance the practice target.', 'the player lacks a felt measurement for the shift', 'checking only the arrival note instead of the movement size', 'Shift silently and describe the muscle distance before playing the target note.', 'Could you feel the distance before checking the pitch?', ARRAY['shifting','practice-strategy']::text[])
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
    notes = trim(coalesce(s.notes, '') || ' Semantic drift cleanup batch 4: title, summary, and tags aligned to contextual_clues.')
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

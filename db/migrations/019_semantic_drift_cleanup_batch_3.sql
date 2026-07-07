-- 019_semantic_drift_cleanup_batch_3.sql
-- Conservative semantic cleanup for high-confidence ai_proposed drift rows.
-- Keeps rows unpublished; improves title/use/summary/tags from direct transcript clues.

BEGIN;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      ('1FN_xHL-u-Q', 195, 250, 'Full Tone in Scales: Body and Bow Awareness', 'the player is using scales to monitor tone, bow, and body feedback together', 'The clue asks the player to feel the bow, fingers, wrist, arm, elbow, and forearm while keeping every note full. This is scale practice as a whole-body tone check, not just pitch correction.', 'the scale loses full tone when attention narrows to notes only', 'checking pitch while ignoring bow and body feedback', 'Play one slow scale and scan bow, wrist, arm, elbow, and forearm on every note.', 'Did every note keep a full tone while the body stayed aware?', ARRAY['scales','bow-relaxation','bow-speed']::text[]),
      ('1R8WiILKtJs', 127, 148, 'Stop and Hold: Confirm the Next Note', 'the player needs to verify the next pitch before continuing', 'The clue says to stop and hold the next note instead of passing through it out of tune. Use the hold as a pitch checkpoint before rebuilding the phrase.', 'the player keeps moving before knowing whether the target note is right', 'correcting after the miss instead of stopping to confirm the note', 'Stop on the next note, hold it until it is clearly in tune, then continue.', 'Did the held note confirm the target before the phrase moved on?', ARRAY['intonation','practice-strategy']::text[]),
      ('1R8WiILKtJs', 304, 335, 'Drop the Extra Note After It Works', 'the player is simplifying a passage, then removing the helper note once the motion is secure', 'The clue describes playing one note once, combining two notes, and then dropping the extra note. Treat this as a scaffold: add the helper only long enough to organize the motion.', 'the helper note stays in the practice longer than needed', 'repeating the scaffold without testing whether it can be removed', 'Play with the helper note twice, then remove it and keep the same motion.', 'Could you drop the extra note without losing the result?', ARRAY['practice-strategy','intonation']::text[]),
      ('2FohGL_sGHI', 0, 27, 'Finger First, Bow Second', 'the player is separating left-hand placement from bow movement to clean up coordination', 'The clue says to deliberately put the finger down first and then move the bow. Separate the actions so timing is clear before reconnecting them.', 'left hand and bow arrive at the same time without coordination', 'moving the bow before the finger is prepared', 'Place the finger silently, then move the bow; repeat until the order feels automatic.', 'Was the finger prepared before the bow moved?', ARRAY['practice-strategy','string-crossing','intonation']::text[]),
      ('3bAWqnjPfV4', 311, 360, 'Entrance Cue: Stop the Bow Between Eighth Notes', 'the player is using bow stops and the first violin entrance as a cue', 'The clue says to stop the bow between eighth notes and listen for the first violin entrance. The useful task is timing and ensemble cueing, not isolated fourth-finger work.', 'the entrance is unclear because the bow keeps smearing through the eighth notes', 'practicing the notes without listening for the cue', 'Stop the bow between eighth notes, then enter only after naming the first violin cue.', 'Did the bow stop make the entrance cue easier to hear?', ARRAY['bow-changes','orchestral-balance','performance-context']::text[]),
      ('3bAWqnjPfV4', 404, 444, 'Second Finger Route to the G', 'the player is using position choice to avoid hopping second finger awkwardly', 'The clue says the route avoids thinking about hopping second finger over to hit the G. Use the position plan to make the G reachable without a last-second finger jump.', 'the second finger has to hop awkwardly to reach the G', 'leaving the hand in a position that makes the G reactive', 'Set the position first, then place second finger on G without a hop.', 'Did the G become a placement instead of a jump?', ARRAY['shifting','intonation']::text[]),
      ('517uzXPQ3xg', 156, 182, 'Tap the Pitch for Performer Reassurance', 'the player taps the target pitch to hear it before committing in performance', 'The clue says the tap is subtle and gives reassurance about what pitch it will be. Use the tap as an intonation check that prepares the ear and hand before the note speaks.', 'the player lacks confidence about the pitch before playing it', 'waiting for the sounded note to reveal whether the hand landed correctly', 'Tap the target lightly, hear the pitch, then play it with the same hand placement.', 'Did the tap make the pitch feel predictable?', ARRAY['intonation','practice-strategy']::text[]),
      ('517uzXPQ3xg', 590, 610, 'Held Note: Avoid the Plain Sound', 'the player is shaping a held note so its length has musical interest', 'The clue says the note must be held for its full length and warns against making it plain. Treat the held note as performance shaping rather than travel coordination.', 'the held note lasts long enough but sounds flat or plain', 'counting the duration without shaping the sound', 'Hold the note once plainly, then repeat with a deliberate color or dynamic shape.', 'Did the long note have a reason to keep listening?', ARRAY['performance-context','bow-speed','vibrato']::text[]),
      ('517uzXPQ3xg', 745, 786, 'Slurred Fast Notes and Higher-Note Pop', 'the player is slurring fast notes while using the higher D for a little more pop', 'The clue says the fast notes are slurred and that the D can be played like the C but with more pop because it is higher. Frame this as articulation and color choice.', 'fast notes blur or the higher note pops accidentally', 'slurring without deciding how much the higher note should project', 'Slur the fast notes, then repeat while controlling how much the higher D pops.', 'Did the higher note pop by design rather than by accident?', ARRAY['performance-context','bow-changes','bow-speed']::text[]),
      ('69_-GJO5Z9M', 390, 429, 'Eye Check: Repeat the Note Without Moving the Hand', 'the player is keeping the hand still and using visual feedback for repeated notes', 'The clue says not to move the hand so the other fingers stay in place, and to use the eyes when repeating a note in the same spot. This is position stability, not vibrato.', 'repeated notes cause the hand frame to drift', 'moving the whole hand when only the finger needs to repeat', 'Keep the hand still, watch the finger return to the same spot, then play the repeat.', 'Did the repeated note preserve the hand frame?', ARRAY['practice-strategy','shifting','intonation']::text[]),
      ('7YvI9La1T2U', 7, 28, 'Fast Bow Economy: Use Less Bow', 'the player is limiting bow amount so the passage can move quickly', 'The clue says too much bow will slow the player down. Use bow economy as the first variable before adding the rest of the passage.', 'the bow stroke is too large for the speed of the passage', 'trying to play faster while keeping the same amount of bow', 'Play the passage with half the bow amount and listen for whether speed becomes easier.', 'Did less bow make the passage quicker without sounding cramped?', ARRAY['bow-speed','practice-strategy']::text[]),
      ('7YvI9La1T2U', 347, 360, 'Reverse Chord: Missing the D String', 'the player is comparing a reverse chord that omits the D string with one that uses all four strings', 'The clue says the written reverse chord is missing the D string and compares it with the full four-note version. The useful issue is chord/string choice, not generic practice strategy.', 'the player treats two different chord shapes as the same', 'adding or omitting the D string without hearing the difference', 'Play the reverse chord without the D string, then with all four notes, and choose the intended version.', 'Could you hear which chord shape the passage needs?', ARRAY['string-crossing','double-stops','performance-context']::text[]),
      ('7YvI9La1T2U', 420, 471, 'Right-Hand Space for the Shift', 'the player is creating a small right-hand space so the left-hand shift can land cleanly', 'The clue says a little space appears in the right hand and that the player needs it. Use that space deliberately so the shifting finger has time to arrive in tune.', 'the left hand does not have enough time to land before the note speaks', 'trying to hide all space and forcing the shift late', 'Add a tiny right-hand space, land the shift, then reduce the space only if the pitch stays secure.', 'Did the right-hand space give the shift enough time?', ARRAY['shifting','bow-changes','intonation']::text[]),
      ('CvWVNMybMeQ', 123, 151, 'Different Position for the F', 'the player is adjusting position because the intended F keeps coming out as F-sharp', 'The clue says the target F requires a different position and that staying put produces F-sharp. Move the hand frame until the natural F is available.', 'the player keeps hitting F-sharp instead of F natural', 'staying in the old position and trying to correct only with the finger', 'Shift the hand frame first, then place the F without twisting the finger.', 'Did the new position make F natural available?', ARRAY['shifting','intonation']::text[]),
      ('CvWVNMybMeQ', 164, 180, 'Extended Fifth Position: Map the Space', 'the player is distinguishing fifth position from extended fifth position', 'The clue says everything fits between the current spot and the next fifth position, the extended fifth position. Clarify the map so extensions are not mistaken for a full new position.', 'the player confuses an extension with a new position', 'moving the whole hand when only the frame needs to extend', 'Name the normal fifth frame, then add the extension without shifting the base of the hand.', 'Was this a new position or an extension of the frame?', ARRAY['shifting','intonation']::text[]),
      ('CvWVNMybMeQ', 190, 234, 'E-flat Fifth: Extension Before the New Position', 'the player is using an extension inside E-flat fifth before moving to the next note', 'The clue says the E natural is extended next to second finger inside E-flat fifth, not a new position. Keep the hand in frame, then let the next note define the move.', 'the hand shifts too early instead of using the extension', 'treating every high note as a position change', 'Stay in the E-flat fifth frame, extend for E natural, then move only when the next note requires it.', 'Did the extension stay inside the position frame?', ARRAY['shifting','intonation']::text[]),
      ('CvWVNMybMeQ', 270, 330, 'E-flat Fifth: Know the Position Before the Pitch', 'the player is using E-flat fifth position to organize intonation before playing', 'The clue repeats that the first note is extended inside E-flat fifth. Use the named position as the intonation map so the fingers know where the pitch belongs.', 'the pitch is corrected note by note without a position map', 'placing the note before deciding which position frame it belongs to', 'Name E-flat fifth, set the frame silently, then play the extended note.', 'Did knowing the position make the pitch easier to place?', ARRAY['intonation','shifting']::text[]),
      ('CvWVNMybMeQ', 364, 406, 'Consistent Hand Frame for the Octave', 'the player is forming an octave by keeping the hand frame consistent', 'The clue says the hand frame forms the octave and that consistency reveals which position the player is in. Use the octave as the proof that the position map is stable.', 'the octave changes because the hand frame is inconsistent', 'checking only the sounded notes instead of the frame that produces them', 'Form the hand frame silently, play the octave, and check whether the frame moved.', 'Did the octave confirm a consistent position frame?', ARRAY['shifting','intonation']::text[]),
      ('EKeY_En_46g', 0, 46, 'Bow Grip: Pinky Roll and Bent Thumb', 'the player is building a relaxed bow grip with pinky motion and a bent thumb', 'The clue asks the player to roll and straighten the pinky, remove the bow, and bend the thumb. This is bow-grip setup, not fourth-finger technique.', 'the bow grip stiffens because pinky and thumb are not moving independently', 'holding the bow while trying to fix the grip all at once', 'Take the bow away, bend the thumb, then roll and straighten the pinky slowly.', 'Could the pinky move while the thumb stayed bent?', ARRAY['bow-relaxation','practice-strategy']::text[]),
      ('EKeY_En_46g', 109, 168, 'Relaxed Bow Grip Before the Shift', 'the player is resetting bow-grip relaxation before aiming for the shift', 'The clue says the relaxed bow grip should be available, then the next part aims for the shift. Keep the right hand quiet so the left-hand shift is not paired with new tension.', 'the shift is practiced while the bow grip tightens', 'adding the shift before the bow hand is relaxed', 'Check the bow grip, then play the shift while keeping the same relaxed hand shape.', 'Did the bow grip stay relaxed when the shift appeared?', ARRAY['bow-relaxation','shifting']::text[]),
      ('EKeY_En_46g', 197, 231, 'Stay in Position: 1-2-4 and Harmonic Check', 'the player is using a 1-2-4 pattern, staying in position, and using harmonics to check the frame', 'The clue lists 1-2-4, staying in position, hopping third finger over, extending up, and using harmonics. Treat this as a position-map exercise with harmonic feedback.', 'the hand loses position while fingers hop and extend', 'shifting unnecessarily instead of staying in the mapped frame', 'Set the 1-2-4 frame, use the harmonic as a check, then add the finger hop and extension.', 'Did the harmonic confirm the position frame?', ARRAY['shifting','intonation','practice-strategy']::text[])
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
    notes = trim(coalesce(s.notes, '') || ' Semantic drift cleanup batch 3: title, summary, and tags aligned to contextual_clues.')
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

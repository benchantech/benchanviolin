-- 021_semantic_drift_cleanup_batch_5.sql
-- Conservative semantic cleanup for high-confidence ai_proposed drift rows.
-- Keeps rows unpublished; improves title/use/summary/tags from direct transcript clues.

BEGIN;

WITH fixes AS (
  SELECT *
  FROM (
    VALUES
      ('S-xMtLyNw1w', 250, 302, 'Vibrato: Watch the Elbow Motion', 'the player is learning that vibrato motion includes the elbow, not only the finger', 'The clue points to the lower part of the motion and asks the player to watch the elbow. Frame the segment as vibrato mechanics driven by coordinated arm movement.', 'vibrato is treated as only a finger motion', 'moving the finger while ignoring the elbow that supports it', 'Vibrate slowly while watching whether the elbow participates in the motion.', 'Did the elbow help the vibrato move?', ARRAY['vibrato','bow-relaxation']::text[]),
      ('S-xMtLyNw1w', 270, 321, 'Vibrato: Finger Bends After the Elbow Moves', 'the player is coordinating finger bend with elbow motion in vibrato', 'The clue says the finger bends at about the same speed as the elbow, but cannot move until the elbow moves first. Use the elbow as the initiator for a relaxed vibrato cycle.', 'the finger tries to vibrate before the arm has initiated motion', 'forcing the fingertip instead of letting the elbow start the movement', 'Move the elbow slowly first, then let the finger bend at the same speed.', 'Did the finger wait for the elbow?', ARRAY['vibrato','practice-strategy']::text[]),
      ('S-xMtLyNw1w', 360, 397, 'Vibrato: Bent Finger Motion', 'the player is developing vibrato from a bent finger rather than sliding the whole hand', 'The clue says good vibrato comes from sticking the finger down and moving slowly from a bent position, not trying to move the whole hand. Keep the finger flexible and curved.', 'vibrato turns into a whole-hand slide', 'straightening the finger and dragging the hand instead of bending the joint', 'Place a bent finger and rock it slowly without moving the hand up the neck.', 'Did the finger bend without turning into a slide?', ARRAY['vibrato','practice-strategy']::text[]),
      ('SfwD0wHKqoI', 32, 79, 'Harmonic Fingering: Use Third Finger Instead of Fourth', 'the player is choosing third finger to hit a harmonic more easily than fourth finger', 'The clue says the easiest way to hit the harmonic is to keep third finger and use it instead of fourth. Make the fingering choice around reliability of the harmonic.', 'the harmonic is missed because the weaker fourth finger is used unnecessarily', 'forcing fourth finger when third finger gives a cleaner target', 'Try the harmonic with fourth finger, then third finger, and keep the more reliable fingering.', 'Which finger found the harmonic more cleanly?', ARRAY['intonation','fourth-finger','practice-strategy']::text[]),
      ('SfwD0wHKqoI', 76, 98, 'Shift Until the Hand Meets the Violin Body', 'the player is using the slide and contact with the violin body as a position reference', 'The clue says to feel the slide while shifting up and notice when the hand collides with the violin. Use that contact point as a reference without hitting it too hard.', 'the high shift lacks a physical stopping point', 'aiming only by pitch and ignoring the tactile body reference', 'Slide up slowly until the hand reaches the violin body, then lighten the contact.', 'Did the body contact give the shift a reference point?', ARRAY['shifting','practice-strategy']::text[]),
      ('SfwD0wHKqoI', 118, 137, 'Effortless Bowing: Watch the Hand', 'the player is studying why a bowing looks effortless through hand relaxation', 'The clue discusses effortless bowing and asks the viewer to look closely at the hand. This is a bow-hand relaxation observation, not fourth-finger work.', 'the bowing is analyzed as a left-hand issue instead of hand relaxation', 'watching notes and fingers while missing the bow hand', 'Watch the bow hand alone and identify what stays relaxed during the stroke.', 'What makes the bowing look effortless?', ARRAY['bow-relaxation','performance-context']::text[]),
      ('SfwD0wHKqoI', 148, 180, 'Pinky Counterbalance at the Frog', 'the player is using the pinky to counterbalance bow weight near the frog', 'The clue says the pinky helps counterbalance weight at the frog so the bow does not scratch. Treat the pinky as right-hand balance, not left-hand fourth finger.', 'the bow scratches at the frog because the hand lacks counterbalance', 'letting the bow weight collapse without pinky support', 'At the frog, add only enough pinky counterbalance to keep the sound from scratching.', 'Did the pinky balance the frog without stiffening?', ARRAY['bow-relaxation','sounding-point']::text[]),
      ('T12mQVEA6bM', 147, 180, 'Shift During the Open A', 'the player is using open A notes to hide the shift', 'The clue explicitly says to shift while playing the open A because it is an opportunity to shift without hearing it. Time the position change inside the open-string cover.', 'the shift is audible because it happens outside the open string', 'waiting until after the open A to move', 'Play the open A and move the hand during that sound before the next stopped note.', 'Did the open A hide the shift?', ARRAY['shifting','performance-context']::text[]),
      ('T12mQVEA6bM', 253, 290, 'Octaves: Lead With the Lower Note', 'the player is organizing octaves by leading with the lower note and letting the top follow', 'The clue says these octaves should lead with the lower note while the higher note follows in a square hand position. Use the lower note as the frame anchor.', 'the octave top note leads and pulls the hand out of shape', 'aiming for the upper note before the lower-note frame is secure', 'Place the lower note first, form the square hand, then add the top note.', 'Did the upper note follow the lower-note frame?', ARRAY['double-stops','intonation','staccato']::text[]),
      ('UDxKpYNJUyk', 47, 78, 'Home String: D String to A String Crossing', 'the player is extending the pinky or bending the wrist while treating D as the home string', 'The clue says the home base is the D string and the A string is the crossing target, with pinky extension or wrist bend as options. Organize the crossing around the home string.', 'the hand loses its base while reaching across strings', 'treating both strings equally instead of anchoring the D string', 'Return to the D string after each A-string crossing and keep the hand shape compact.', 'Did the D string stay as home base?', ARRAY['string-crossing','fourth-finger']::text[]),
      ('Xq0xj4x8UgU', 103, 130, 'Bow Hand: Pinky Counterbalance Weight', 'the player is adding a small amount of pinky counterbalance to remove unwanted bow noise', 'The clue says the pinky adds a little counterbalance weight and that this should remove unwanted sounds. Use the right-hand pinky for bow balance.', 'unwanted bow sounds appear because the bow weight is not balanced', 'pressing with the hand instead of adding small pinky counterbalance', 'At the frog, add a small pinky counterbalance and listen for reduced extra noise.', 'Did the unwanted sound disappear without stiffness?', ARRAY['bow-relaxation','sounding-point']::text[]),
      ('aICv2fgoNg0', 86, 106, 'Fourth Finger Reach: Hand Angle Matters', 'the player needs the hand angle to make fourth finger reach the fingerboard quickly', 'The clue says fourth finger must reach quickly, but a hand pointed outward makes that difficult. Adjust the hand angle before asking the pinky to move.', 'fourth finger is slow because the hand angle blocks it', 'practicing pinky speed while the hand is pointed away from the fingerboard', 'Aim the hand toward the fingerboard, then place fourth finger quickly without reaching.', 'Did the hand angle make fourth finger quicker?', ARRAY['fourth-finger','practice-strategy']::text[]),
      ('aICv2fgoNg0', 223, 269, 'Open Strings Hide the Third-Position Shift', 'the player is using open strings before measure 55 to reach third position cleanly', 'The clue says open strings are used so the player can get up to third position for the next spot. Treat the open strings as cover for the shift.', 'the third-position arrival is exposed because the open-string cover is unused', 'waiting until the stopped note to shift', 'Move into third position during the open strings, then confirm the next stopped note.', 'Did the open strings hide the move to third position?', ARRAY['shifting','performance-context']::text[]),
      ('aICv2fgoNg0', 264, 294, 'First-Position 1-3 to 2-4: Avoid the A String', 'the player is managing a difficult first-position 1-3 to 2-4 move without touching the A string', 'The clue calls the passage brutal and says the pinky touching the A string causes trouble while trying to stay on the D string. Keep the left hand compact and string clearance clean.', 'the pinky hits the A string during the 1-3 to 2-4 move', 'reaching broadly instead of preserving D-string clearance', 'Practice 1-3 to 2-4 silently on the D string, checking that pinky clears the A string.', 'Did the pinky avoid the A string?', ARRAY['fourth-finger','string-crossing','intonation']::text[]),
      ('aICv2fgoNg0', 369, 389, 'Shift During the Open String', 'the player is using an open string to arrive before the next position must sound', 'The clue says to shift during the open string so the player arrives before the next-position notes are heard. Make the open string the travel window.', 'the player arrives late because the shift happens after the open string', 'using the open string as rest instead of travel time', 'Start the shift as soon as the open string begins, then land before the stopped note.', 'Did the open string give enough time to arrive?', ARRAY['shifting','practice-strategy']::text[]),
      ('aICv2fgoNg0', 456, 504, 'Slow Practice: Match Right-Hand Pace', 'the player is keeping the right hand moving evenly during slow practice', 'The clue says that when practicing slowly, the right hand must move at the same pace so all notes sound even. Match bow timing to the slowed left-hand work.', 'slow practice becomes uneven because the bow does not match the hand pace', 'slowing the fingers while letting the bow timing wander', 'Play slowly while counting the bow movement evenly through every note.', 'Did all notes stay even at the slower pace?', ARRAY['practice-strategy','bow-speed']::text[]),
      ('ajbxxs-4SMk', 143, 178, 'String Crossing With Spaces', 'the player is adding spaces to make string crossings manageable', 'The clue says to practice string crossings first with spaces, stealing time from the previous eighth note. Use the space as training for the bow move.', 'string crossings are rushed because no time is reserved for the move', 'trying to cross cleanly without first practicing the space', 'Add a small space before each crossing, then gradually shrink it.', 'Did the space make the string crossing clean?', ARRAY['string-crossing','practice-strategy','bow-changes']::text[]),
      ('ajbxxs-4SMk', 210, 233, 'Stop-Move String Crossing', 'the player is stopping the bow before moving strings to remove in-between sound', 'The clue gives the pattern stop, move, stop, move and says it prevents the sound between string changes. Train the bow to stop before changing levels.', 'the crossing makes extra in-between string noise', 'moving strings while the bow is still sounding', 'Practice stop, move, play on each crossing until the extra sound disappears.', 'Did stopping before the move remove the in-between sound?', ARRAY['string-crossing','bow-changes']::text[]),
      ('ajbxxs-4SMk', 279, 320, 'Stop Bow Before Changing Strings', 'the player is making string changes clean by stopping the bow first', 'The clue repeats that the bow should stop before changing strings. Use the stopped bow as the core variable before restoring tempo.', 'string changes smear because the bow keeps moving', 'changing arm level while the bow is still sounding', 'Stop the bow, move to the new string, then restart with the same tone.', 'Was the string change silent between notes?', ARRAY['string-crossing','bow-changes','practice-strategy']::text[]),
      ('cdOu5rwy0Dc', 57, 106, 'Arm-Led Crossing to the D String', 'the player is practicing a string crossing by stopping the bow and moving to D with the arm', 'The clue says to play the first note, stop the bow, and move to the D string using the arm. Keep shoulders down and let the arm level create the crossing.', 'the crossing is forced by wrist or shoulder tension', 'moving to D string without stopping and resetting the arm level', 'Play, stop, move the arm to D, then play again with shoulders down.', 'Did the arm level make the D-string crossing cleaner?', ARRAY['string-crossing','bow-changes','bow-relaxation']::text[])
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
    notes = trim(coalesce(s.notes, '') || ' Semantic drift cleanup batch 5: title, summary, and tags aligned to contextual_clues.')
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

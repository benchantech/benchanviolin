insert into tag_groups (slug, label, display_order, is_public) values
  ('bowing-and-contact', 'Bowing & Contact', 10, true),
  ('left-hand-and-intonation', 'Left Hand & Intonation', 20, true),
  ('articulation-and-strokes', 'Articulation & Strokes', 30, true),
  ('ensemble-and-audition', 'Ensemble & Audition', 40, true)
on conflict (slug) do update set label = excluded.label, display_order = excluded.display_order, is_public = excluded.is_public;

insert into tags (group_id, slug, label, description, learner_prompt, sort_order, is_public, is_active)
select g.id, x.slug, x.label, x.description, x.learner_prompt, x.sort_order, true, true
from (values
  ('articulation-and-strokes', 'bartok-pizzicato', 'Bartok pizzicato', 'A snap pizzicato where the string rebounds against the fingerboard for a percussive orchestral effect.', 'I need the snapped pizzicato effect to speak without over-pulling the string.', 10),
  ('articulation-and-strokes', 'ricochet', 'Ricochet', 'A controlled rebound stroke in which the bow naturally bounces after prepared contact.', 'My bow bounces or I cannot control the rebound.', 20),
  ('bowing-and-contact', 'bow-drop', 'Bow-drop', 'Starting above the string and releasing into contact with a useful, relaxed arm motion.', 'My dropped bow stroke sounds weak or uncontrolled.', 30),
  ('bowing-and-contact', 'bow-relaxation', 'Bow relaxation', 'Reducing grip and arm tension so the bow can rebound or sustain without shaking.', 'My bow hand gets tense or the bow shakes.', 40),
  ('bowing-and-contact', 'arm-weight', 'Arm weight', 'Using relaxed arm transfer into the string rather than pressing or passively dropping.', 'I need the sound to speak without squeezing.', 50),
  ('bowing-and-contact', 'string-crossing', 'String crossing', 'Changing arm level and geometry so the same stroke works across strings.', 'String changes interrupt the stroke.', 60),
  ('ensemble-and-audition', 'orchestral-balance', 'Orchestral balance', 'Choosing dynamic weight and hierarchy according to the surrounding ensemble texture.', 'I need to fit the orchestra instead of overplaying.', 70),
  ('left-hand-and-intonation', 'trills', 'Trills', 'Keeping ornamental motion present while still serving the musical texture.', 'My trills stick out or feel uncontrolled.', 80),
  ('articulation-and-strokes', 'accent', 'Accent', 'Placing energy at the front of a note without sustaining unnecessary pressure.', 'My accents sound forced or heavy.', 90),
  ('articulation-and-strokes', 'sforzando-piano', 'Sforzando-piano', 'A clear attack followed by immediate release into piano.', 'I need the attack to speak and then decay immediately.', 100)
) as x(group_slug, slug, label, description, learner_prompt, sort_order)
join tag_groups g on g.slug = x.group_slug
on conflict (slug) do update set
  group_id = excluded.group_id,
  label = excluded.label,
  description = excluded.description,
  learner_prompt = excluded.learner_prompt,
  sort_order = excluded.sort_order,
  is_public = excluded.is_public,
  is_active = excluded.is_active;

insert into tag_aliases (tag_id, alias, alias_kind, priority, is_public)
select t.id, x.alias, 'learner_phrase', x.priority, true
from (values
  ('ricochet', 'bow bounce', 95),
  ('ricochet', 'bouncy bow', 90),
  ('ricochet', 'bow bouncing', 85),
  ('bow-drop', 'drop bow', 95),
  ('bow-relaxation', 'tense bow hand', 95),
  ('bow-relaxation', 'my bow shakes', 90),
  ('string-crossing', 'string changes', 95),
  ('bartok-pizzicato', 'snap pizzicato', 95),
  ('bartok-pizzicato', 'snap pizz', 90),
  ('orchestral-balance', 'orchestra balance', 90)
) as x(tag_slug, alias, priority)
join tags t on t.slug = x.tag_slug
on conflict (tag_id, normalized_alias) do update set
  alias = excluded.alias,
  alias_kind = excluded.alias_kind,
  priority = excluded.priority,
  is_public = excluded.is_public;

insert into videos (youtube_video_id, title, canonical_url, duration_seconds, channel_name, is_public)
values (
  '0f6n1HMHI6g',
  'Tan Dun YouTube Symphony Audition Walkthrough',
  'https://www.youtube.com/watch?v=0f6n1HMHI6g',
  801,
  'Ben Chan Violin',
  true
)
on conflict (youtube_video_id) do update set
  title = excluded.title,
  canonical_url = excluded.canonical_url,
  duration_seconds = excluded.duration_seconds,
  channel_name = excluded.channel_name,
  is_public = excluded.is_public;

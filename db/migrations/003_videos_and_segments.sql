create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null unique,
  title text not null,
  canonical_url text not null,
  duration_seconds integer not null,
  channel_name text not null default 'Ben Chan Violin',
  is_public boolean not null default true
);

create table if not exists segments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  start_seconds integer not null check (start_seconds >= 0),
  end_seconds integer not null check (end_seconds > start_seconds),
  segment_key text not null unique,
  segment_title text not null,
  timestamp_label text not null,
  start_url text not null,
  use_when text not null,
  teaching_summary text not null,
  problem_statement text not null default '',
  common_failure_mode text not null default '',
  suggested_experiment text not null default '',
  reflection_prompt text not null default '',
  review_status text not null default 'draft',
  is_public boolean not null default false,
  quality_score numeric(4,3) not null default 0.900,
  source_type text not null default 'local_whisper_json_plus_manual_review',
  transcript_source_file text not null default '',
  notes text not null default '',
  unique (video_id, start_seconds, end_seconds)
);

create table if not exists segment_tags (
  segment_id uuid not null references segments(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  relevance integer not null default 80,
  is_primary boolean not null default false,
  assigned_by text not null default 'manual_review',
  primary key (segment_id, tag_id)
);

create index if not exists segment_tags_tag_segment_idx on segment_tags (tag_id, segment_id);
create index if not exists segments_video_start_idx on segments (video_id, start_seconds);
create index if not exists segments_public_reviewed_idx on segments (video_id, start_seconds)
  where is_public = true and review_status = 'manual_reviewed';

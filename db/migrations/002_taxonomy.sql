create table if not exists tag_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  display_order integer not null default 0,
  is_public boolean not null default true
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references tag_groups(id) on delete restrict,
  slug text not null unique,
  label text not null,
  normalized_label text generated always as (lower(regexp_replace(label, '[^a-zA-Z0-9]+', ' ', 'g'))) stored,
  description text not null default '',
  learner_prompt text not null default '',
  sort_order integer not null default 0,
  is_public boolean not null default true,
  is_active boolean not null default true
);

create table if not exists tag_aliases (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references tags(id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (lower(regexp_replace(alias, '[^a-zA-Z0-9]+', ' ', 'g'))) stored,
  alias_kind text not null default 'learner_phrase',
  priority integer not null default 50,
  is_public boolean not null default true,
  unique (tag_id, normalized_alias)
);

create index if not exists tags_normalized_label_trgm_idx on tags using gin (normalized_label gin_trgm_ops);
create index if not exists tag_aliases_normalized_alias_trgm_idx on tag_aliases using gin (normalized_alias gin_trgm_ops);
create index if not exists tags_public_active_idx on tags (is_public, is_active, sort_order);

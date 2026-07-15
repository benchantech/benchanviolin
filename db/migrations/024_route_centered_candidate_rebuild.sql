-- Route-centered candidate rebuild support.
-- This does not mark any clip as owner-reviewed. It adds enough structure to
-- rebuild generated candidates from transcript evidence and align each one to
-- a deterministic technical route or branch.

BEGIN;

CREATE TABLE IF NOT EXISTS public.technical_routes (
  route_id text PRIMARY KEY,
  label text NOT NULL,
  domain text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  route_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technical_route_nodes (
  node_id text PRIMARY KEY,
  route_id text NOT NULL REFERENCES public.technical_routes(route_id) ON DELETE CASCADE,
  parent_node_id text REFERENCES public.technical_route_nodes(node_id) ON DELETE CASCADE,
  branch_option_id text,
  node_kind text NOT NULL DEFAULT 'route',
  prompt text NOT NULL DEFAULT '',
  label text NOT NULL,
  summary text NOT NULL DEFAULT '',
  first_action text NOT NULL DEFAULT '',
  verification text NOT NULL DEFAULT '',
  stop_condition text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  node_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.segments
  ADD COLUMN IF NOT EXISTS route_id text REFERENCES public.technical_routes(route_id),
  ADD COLUMN IF NOT EXISTS route_node_id text REFERENCES public.technical_route_nodes(node_id),
  ADD COLUMN IF NOT EXISTS branch_option_id text,
  ADD COLUMN IF NOT EXISTS route_match_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route_match_reason text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS evidence_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS evidence_start_seconds integer,
  ADD COLUMN IF NOT EXISTS evidence_end_seconds integer,
  ADD COLUMN IF NOT EXISTS validation_status text NOT NULL DEFAULT 'unvalidated',
  ADD COLUMN IF NOT EXISTS owner_visible boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS segments_route_idx
  ON public.segments(route_id, branch_option_id, route_match_score DESC);

CREATE INDEX IF NOT EXISTS segments_route_node_idx
  ON public.segments(route_node_id, route_match_score DESC);

CREATE INDEX IF NOT EXISTS segments_owner_visible_idx
  ON public.segments(owner_visible, review_status, route_match_score DESC);

CREATE TABLE IF NOT EXISTS public.route_gap_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  transcript_source_file text NOT NULL,
  start_seconds integer NOT NULL,
  end_seconds integer NOT NULL,
  evidence_text text NOT NULL,
  suggested_label text NOT NULL DEFAULT '',
  suggested_reason text NOT NULL DEFAULT '',
  occurrence_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'candidate',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (video_id, start_seconds, end_seconds, suggested_label)
);

COMMIT;

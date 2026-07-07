-- 20260707_01_add_contextual_search_clues.sql
-- Adds transcript-language retrieval clues to existing segments.
-- These clues are not categories and do not alter segment titles, tags, or summaries.

BEGIN;

ALTER TABLE public.segments
  ADD COLUMN IF NOT EXISTS contextual_clues text[] NOT NULL DEFAULT '{}'::text[];

-- Search document is derived from the segment's user-facing text
-- plus the transcript-language clues seeded separately.
ALTER TABLE public.segments
  ADD COLUMN IF NOT EXISTS contextual_search_document tsvector NOT NULL DEFAULT ''::tsvector;

CREATE OR REPLACE FUNCTION public.refresh_segment_contextual_search_document()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.contextual_search_document :=
    to_tsvector(
      'english',
      coalesce(NEW.segment_title, '') || ' ' ||
      coalesce(NEW.teaching_summary, '') || ' ' ||
      coalesce(array_to_string(NEW.contextual_clues, ' '), '')
    );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS segments_contextual_search_document_refresh ON public.segments;

CREATE TRIGGER segments_contextual_search_document_refresh
BEFORE INSERT OR UPDATE OF segment_title, teaching_summary, contextual_clues
ON public.segments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_segment_contextual_search_document();

UPDATE public.segments
SET contextual_search_document = to_tsvector(
  'english',
  coalesce(segment_title, '') || ' ' ||
  coalesce(teaching_summary, '') || ' ' ||
  coalesce(array_to_string(contextual_clues, ' '), '')
);

CREATE INDEX IF NOT EXISTS segments_contextual_clues_gin_idx
  ON public.segments
  USING gin (contextual_clues);

CREATE INDEX IF NOT EXISTS segments_contextual_search_document_gin_idx
  ON public.segments
  USING gin (contextual_search_document);

COMMIT;

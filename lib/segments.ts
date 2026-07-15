import { getSql } from "@/lib/db";

export type Segment = {
  segment_id: string;
  segment_key: string;
  segment_title: string;
  timestamp_label: string;
  start_seconds: number;
  end_seconds: number;
  start_url: string;
  use_when: string;
  teaching_summary: string;
  suggested_experiment: string;
  reflection_prompt: string;
  contextual_clues: string[];
  review_status: string;
  video_title: string;
  youtube_video_id: string;
  canonical_url: string;
  tags: { slug: string; label: string; is_primary: boolean }[];
};

type SegmentRow = Omit<Segment, "tags"> & {
  tags: string | { slug: string; label: string; is_primary: boolean }[];
};

export async function getSegmentsForTag(slug: string): Promise<Segment[]> {
  const sql = await getSql();
  const rows = (await sql.query(
    `
      select
        s.id as segment_id,
        s.segment_key,
        s.segment_title,
        s.timestamp_label,
        s.start_seconds,
        s.end_seconds,
        s.start_url,
        s.use_when,
        s.teaching_summary,
        s.suggested_experiment,
        s.reflection_prompt,
        s.contextual_clues,
        s.review_status,
        v.title as video_title,
        v.youtube_video_id,
        v.canonical_url,
        json_agg(
          json_build_object('slug', all_tags.slug, 'label', all_tags.label, 'is_primary', all_st.is_primary)
          order by all_st.is_primary desc, all_tags.label
        ) as tags
      from tags selected
      join segment_tags selected_st on selected_st.tag_id = selected.id
      join segments s on s.id = selected_st.segment_id
      join videos v on v.id = s.video_id
      join segment_tags all_st on all_st.segment_id = s.id
      join tags all_tags on all_tags.id = all_st.tag_id
      where selected.slug = $1
        and selected.is_public = true
        and v.is_public = true
      group by
        s.id, s.segment_key, s.segment_title, s.timestamp_label, s.start_seconds, s.end_seconds,
        s.start_url, s.use_when, s.teaching_summary, s.suggested_experiment, s.reflection_prompt, s.review_status,
        s.contextual_clues,
        v.title, v.youtube_video_id, v.canonical_url, selected_st.is_primary
      order by selected_st.is_primary desc, s.start_seconds asc
    `,
    [slug],
  )) as SegmentRow[];

  return rows.map((row) => ({
    ...row,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
  }));
}

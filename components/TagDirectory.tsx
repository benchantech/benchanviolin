import type { TagDirectoryItem } from "@/lib/tags";

export function TagDirectory({ tags }: { tags: TagDirectoryItem[] }) {
  const groups = new Map<string, TagDirectoryItem[]>();

  for (const tag of tags) {
    const groupTags = groups.get(tag.group_label) ?? [];
    groupTags.push(tag);
    groups.set(tag.group_label, groupTags);
  }

  return (
    <div className="tag-directory">
      {Array.from(groups.entries()).map(([groupLabel, groupTags]) => (
        <section key={groupLabel} aria-labelledby={`group-${groupLabel.replace(/\W+/g, "-").toLowerCase()}`}>
          <h2 id={`group-${groupLabel.replace(/\W+/g, "-").toLowerCase()}`}>{groupLabel}</h2>
          <div className="tag-list">
            {groupTags.map((tag) => (
              <a key={tag.slug} href={`/library/tags/${tag.slug}`}>
                <span>{tag.label}</span>
                <small>{tag.clip_count} clips</small>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

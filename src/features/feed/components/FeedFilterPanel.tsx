import type { PostSort, PostType } from "../../../entities/post/types";
import type { TagSummary } from "../../../entities/tag/types";

interface FeedFilterPanelProps {
  selectedType?: PostType;
  selectedSort: PostSort;
  selectedTag?: string;
  tags: TagSummary[];
  onSelectType: (value?: PostType) => void;
  onSelectSort: (value: PostSort) => void;
  onSelectTag: (value?: string) => void;
}

const POST_TYPES: Array<{ label: string; value: PostType }> = [
  { label: "Question", value: "question" },
  { label: "Info", value: "info" },
];

const SORTS: Array<{ label: string; value: PostSort }> = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
];

export function FeedFilterPanel({
  selectedType,
  selectedSort,
  selectedTag,
  tags,
  onSelectType,
  onSelectSort,
  onSelectTag,
}: FeedFilterPanelProps) {
  return (
    <section style={{ display: "grid", gap: "12px", background: "#fff", border: "1px solid #e2e8f0", padding: "12px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => onSelectType(undefined)} disabled={!selectedType}>
          All Types
        </button>
        {POST_TYPES.map((item) => (
          <button key={item.value} type="button" onClick={() => onSelectType(item.value)} disabled={selectedType === item.value}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {SORTS.map((item) => (
          <button key={item.value} type="button" onClick={() => onSelectSort(item.value)} disabled={selectedSort === item.value}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => onSelectTag(undefined)} disabled={!selectedTag}>
          All Tags
        </button>
        {tags.map((tag) => (
          <button key={tag.id} type="button" onClick={() => onSelectTag(tag.name)} disabled={selectedTag === tag.name}>
            #{tag.name} ({tag.postCount})
          </button>
        ))}
      </div>
    </section>
  );
}

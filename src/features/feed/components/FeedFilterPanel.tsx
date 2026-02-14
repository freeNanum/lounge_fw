import type { PostSort, PostType } from "../../../entities/post/types";
import type { TagSummary } from "../../../entities/tag/types";

interface FeedFilterPanelProps {
  selectedType?: PostType;
  selectedSort: PostSort;
  selectedTags: string[];
  tags: TagSummary[];
  onSelectType: (value?: PostType) => void;
  onSelectSort: (value: PostSort) => void;
  onToggleTag: (value: string) => void;
  onClearTags: () => void;
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
  selectedTags,
  tags,
  onSelectType,
  onSelectSort,
  onToggleTag,
  onClearTags,
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
        {selectedTags.length > 0 ? (
          <span
            style={{
              border: "1px solid #14b8a6",
              background: "#f0fdfa",
              color: "#0f766e",
              padding: "0 8px",
              borderRadius: "9999px",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Tag Match: ALL ({selectedTags.length})
          </span>
        ) : null}
        <button type="button" onClick={onClearTags} disabled={selectedTags.length === 0}>
          All Tags
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggleTag(tag.name)}
            style={{
              borderColor: selectedTags.includes(tag.name) ? "#14b8a6" : undefined,
              background: selectedTags.includes(tag.name) ? "#f0fdfa" : undefined,
              color: selectedTags.includes(tag.name) ? "#0f766e" : undefined,
            }}
          >
            #{tag.name} ({tag.postCount})
          </button>
        ))}
      </div>
    </section>
  );
}

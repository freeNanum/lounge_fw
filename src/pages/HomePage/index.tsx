import { useSearchParams } from "react-router-dom";
import type { PostSort, PostType } from "../../entities/post/types";
import { useFeedPosts } from "../../features/feed/useFeedPosts";
import { usePopularTags } from "../../features/tag-filter/useTags";
import { FeedFilterPanel } from "../../features/feed/components/FeedFilterPanel";
import { PostFeedList } from "../../features/feed/components/PostFeedList";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

function normalizeTagName(raw: string): string {
  return raw.trim().toLowerCase();
}

export function HomePage() {
  useSeoMeta({
    title: "Community Feed",
    description: "Browse firmware and embedded community posts, questions, and practical tips.",
    path: "/",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = (searchParams.get("type") as PostType | null) ?? undefined;
  const selectedSort = (searchParams.get("sort") as PostSort | null) ?? "latest";
  const selectedTags = [...new Set(searchParams.getAll("tag").map(normalizeTagName).filter(Boolean))];

  const postsQuery = useFeedPosts({
    type: selectedType,
    sort: selectedSort,
    tags: selectedTags,
    limit: 20,
  });

  const tagsQuery = usePopularTags(12);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const setTagParams = (nextTags: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    nextTags.forEach((tagName) => next.append("tag", tagName));
    setSearchParams(next);
  };

  const toggleTag = (tagName: string) => {
    const normalized = normalizeTagName(tagName);
    if (!normalized) {
      return;
    }

    const hasTag = selectedTags.includes(normalized);
    if (hasTag) {
      setTagParams(selectedTags.filter((value) => value !== normalized));
      return;
    }

    setTagParams([...selectedTags, normalized]);
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h1 style={{ margin: 0 }}>Community Feed</h1>

      <FeedFilterPanel
        selectedType={selectedType}
        selectedSort={selectedSort}
        selectedTags={selectedTags}
        tags={tagsQuery.data ?? []}
        onSelectType={(value) => updateParam("type", value)}
        onSelectSort={(value) => updateParam("sort", value)}
        onToggleTag={toggleTag}
        onClearTags={() => setTagParams([])}
      />

      {postsQuery.isLoading ? <div>Loading posts...</div> : null}
      {postsQuery.isError ? <div>Failed to load posts.</div> : null}

      <PostFeedList posts={postsQuery.data?.items ?? []} onToggleTag={toggleTag} />
    </div>
  );
}

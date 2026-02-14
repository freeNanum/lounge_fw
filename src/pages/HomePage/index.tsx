import { useSearchParams } from "react-router-dom";
import type { PostSort, PostType } from "../../entities/post/types";
import { useFeedPosts } from "../../features/feed/useFeedPosts";
import { usePopularTags } from "../../features/tag-filter/useTags";
import { FeedFilterPanel } from "../../features/feed/components/FeedFilterPanel";
import { PostFeedList } from "../../features/feed/components/PostFeedList";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = (searchParams.get("type") as PostType | null) ?? undefined;
  const selectedSort = (searchParams.get("sort") as PostSort | null) ?? "latest";
  const selectedTag = searchParams.get("tag") ?? undefined;

  const postsQuery = useFeedPosts({
    type: selectedType,
    sort: selectedSort,
    tag: selectedTag,
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

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h1 style={{ margin: 0 }}>Community Feed</h1>

      <FeedFilterPanel
        selectedType={selectedType}
        selectedSort={selectedSort}
        selectedTag={selectedTag}
        tags={tagsQuery.data ?? []}
        onSelectType={(value) => updateParam("type", value)}
        onSelectSort={(value) => updateParam("sort", value)}
        onSelectTag={(value) => updateParam("tag", value)}
      />

      {postsQuery.isLoading ? <div>Loading posts...</div> : null}
      {postsQuery.isError ? <div>Failed to load posts.</div> : null}

      <PostFeedList posts={postsQuery.data?.items ?? []} onSelectTag={(tagName) => updateParam("tag", tagName)} />
    </div>
  );
}

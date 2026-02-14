import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearchPosts } from "../../features/search/useSearchPosts";
import { usePopularTags } from "../../features/tag-filter/useTags";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

function normalizeTagName(raw: string): string {
  return raw.trim().toLowerCase();
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const selectedTags = [...new Set(searchParams.getAll("tag").map(normalizeTagName).filter(Boolean))];
  useSeoMeta({
    title: "Search",
    description: "Search posts by keyword and tags in Lounge FW.",
    path: "/search",
  });

  const [queryText, setQueryText] = useState(initial);
  const tagsQuery = usePopularTags(12);

  useEffect(() => {
    setQueryText(initial);
  }, [initial]);

  const searchQuery = useSearchPosts({
    queryText: initial,
    tags: selectedTags,
    limit: 20,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (queryText.trim()) {
      next.set("q", queryText.trim());
    } else {
      next.delete("q");
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

  const hasAppliedFilters = initial.trim().length > 0 || selectedTags.length > 0;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h1 style={{ margin: 0 }}>Search</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          value={queryText}
          onChange={(event) => setQueryText(event.target.value)}
          placeholder="Search posts"
          style={{ flex: 1 }}
        />
        <button type="submit">Search</button>
      </form>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setTagParams([])} disabled={selectedTags.length === 0}>
          All Tags
        </button>
        {tagsQuery.data?.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.name)}
            style={{
              borderColor: selectedTags.includes(normalizeTagName(tag.name)) ? "#14b8a6" : undefined,
              background: selectedTags.includes(normalizeTagName(tag.name)) ? "#f0fdfa" : undefined,
              color: selectedTags.includes(normalizeTagName(tag.name)) ? "#0f766e" : undefined,
            }}
          >
            #{tag.name} ({tag.postCount})
          </button>
        ))}
      </div>

      {hasAppliedFilters ? (
        <section
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
            border: "1px solid #e2e8f0",
            background: "#fff",
            padding: "8px 10px",
          }}
        >
          <strong style={{ fontSize: "13px", color: "#334155" }}>Applied Filters</strong>
          {initial.trim() ? (
            <span style={{ border: "1px solid #cbd5e1", padding: "0 8px", borderRadius: "9999px", fontSize: "13px" }}>
              q: {initial.trim()}
            </span>
          ) : null}
          {selectedTags.length > 0 ? (
            <span style={{ border: "1px solid #14b8a6", background: "#f0fdfa", color: "#0f766e", padding: "0 8px", borderRadius: "9999px", fontSize: "13px" }}>
              tag match: ALL
            </span>
          ) : null}
          {selectedTags.map((tagName) => (
            <span key={tagName} style={{ border: "1px solid #14b8a6", color: "#0f766e", padding: "0 8px", borderRadius: "9999px", fontSize: "13px" }}>
              #{tagName}
            </span>
          ))}
        </section>
      ) : null}

      {searchQuery.isLoading ? <div>Searching...</div> : null}
      {searchQuery.isError ? <div>Search failed.</div> : null}

      <section style={{ display: "grid", gap: "10px" }}>
        {(searchQuery.data?.items ?? []).map((post) => (
          <article key={post.id} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px" }}>
            <h3 style={{ marginBottom: "6px" }}>
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p style={{ marginTop: 0 }}>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

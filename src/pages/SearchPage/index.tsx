import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearchPosts } from "../../features/search/useSearchPosts";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [queryText, setQueryText] = useState(initial);

  useEffect(() => {
    setQueryText(initial);
  }, [initial]);

  const searchQuery = useSearchPosts({
    queryText: initial,
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

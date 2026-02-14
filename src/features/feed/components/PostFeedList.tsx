import { Link } from "react-router-dom";
import type { PostSummary } from "../../../entities/post/types";

interface PostFeedListProps {
  posts: PostSummary[];
  onSelectTag: (tagName: string) => void;
}

export function PostFeedList({ posts, onSelectTag }: PostFeedListProps) {
  return (
    <section style={{ display: "grid", gap: "10px" }}>
      {posts.map((post) => (
        <article key={post.id} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <strong>{post.type.toUpperCase()}</strong>
            <span style={{ color: "#64748b", fontSize: "14px" }}>{post.author.nickname}</span>
          </div>
          <h3 style={{ marginBottom: "6px" }}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
          <p style={{ marginTop: 0 }}>{post.excerpt}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", color: "#475569", fontSize: "14px" }}>
            <span style={{ color: post.isLikedByViewer ? "#0f766e" : "#475569", fontWeight: post.isLikedByViewer ? 700 : 400 }}>
              likes {post.likeCount}
            </span>
            {post.isLikedByViewer ? (
              <span
                style={{
                  border: "1px solid #14b8a6",
                  background: "#f0fdfa",
                  color: "#0f766e",
                  padding: "0 6px",
                  borderRadius: "9999px",
                }}
              >
                Liked
              </span>
            ) : null}
            <span>comments {post.commentCount}</span>
            {post.tags.map((tag) => (
              <button key={tag.id} type="button" onClick={() => onSelectTag(tag.name)}>
                #{tag.name}
              </button>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

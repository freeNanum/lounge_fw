import type { PostDetail } from "../../../entities/post/types";

interface PostDetailCardProps {
  post: PostDetail;
  canEdit: boolean;
  onLikeToggle: () => void;
  onEdit: () => void;
  liking: boolean;
}

export function PostDetailCard({ post, canEdit, onLikeToggle, onEdit, liking }: PostDetailCardProps) {
  return (
    <article style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <strong>{post.type.toUpperCase()}</strong>
        <span style={{ color: "#64748b" }}>{post.author.nickname}</span>
      </div>
      <h1 style={{ marginBottom: "8px" }}>{post.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {post.tags.map((tag) => (
          <span key={tag.id}>#{tag.name}</span>
        ))}
      </div>
      <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
        <button type="button" onClick={onLikeToggle} disabled={liking}>
          {post.isLikedByViewer ? "Unlike" : "Like"}
        </button>
        <span>likes {post.likeCount}</span>
        <span>comments {post.commentCount}</span>
        {canEdit ? (
          <button type="button" onClick={onEdit}>
            Edit Post
          </button>
        ) : null}
      </div>
    </article>
  );
}

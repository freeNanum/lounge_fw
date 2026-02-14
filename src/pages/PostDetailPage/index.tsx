import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/AuthProvider";
import { CommentSection } from "../../features/comments/components/CommentSection";
import { useTogglePostLike } from "../../features/likes/usePostLike";
import { usePostDetail } from "../../features/post-detail/usePostDetail";
import { usePostRealtime } from "../../features/post-detail/usePostRealtime";
import { PostDetailCard } from "../../features/post-detail/components/PostDetailCard";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const postQuery = usePostDetail(postId);
  usePostRealtime(postId);

  const toggleLike = useTogglePostLike(postId ?? "");

  const post = postQuery.data;

  if (!postId) {
    return <div>Invalid post id.</div>;
  }

  if (postQuery.isLoading) {
    return <div>Loading post...</div>;
  }

  if (postQuery.isError || !post) {
    return <div>Post not found.</div>;
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <PostDetailCard
        post={post}
        canEdit={user?.id === post.author.userId}
        onEdit={() => navigate(`/posts/${post.id}/edit`)}
        onLikeToggle={() => {
          if (!user?.id) {
            navigate(ROUTE_PATHS.authLogin);
            return;
          }

          void toggleLike.mutateAsync(post.isLikedByViewer);
        }}
        liking={toggleLike.isPending}
      />

      <CommentSection postId={postId} />
    </div>
  );
}

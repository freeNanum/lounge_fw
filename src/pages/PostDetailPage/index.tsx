import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/AuthProvider";
import { CommentSection } from "../../features/comments/components/CommentSection";
import { useTogglePostLike } from "../../features/likes/usePostLike";
import { usePostDetail } from "../../features/post-detail/usePostDetail";
import { usePostRealtime } from "../../features/post-detail/usePostRealtime";
import { PostDetailCard } from "../../features/post-detail/components/PostDetailCard";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const postQuery = usePostDetail(postId);
  usePostRealtime(postId);

  const toggleLike = useTogglePostLike(postId ?? "");

  const post = postQuery.data;

  useSeoMeta({
    title: post ? post.title : "Post",
    description: post ? post.body.slice(0, 150) : "Read a community post on Lounge FW.",
    path: postId ? `/posts/${postId}` : "/",
    type: "article",
  });

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

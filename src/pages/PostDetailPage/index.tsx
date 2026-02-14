import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/AuthProvider";
import type { CommentItem } from "../../entities/comment/types";
import {
  useCreateComment,
  useDeleteComment,
  usePostComments,
  useUpdateComment,
} from "../../features/comments/usePostComments";
import { useTogglePostLike } from "../../features/likes/usePostLike";
import { usePostDetail } from "../../features/post-detail/usePostDetail";
import { usePostRealtime } from "../../features/post-detail/usePostRealtime";
import { PostDetailCard } from "../../features/post-detail/components/PostDetailCard";
import { CommentsSection } from "../../features/post-detail/components/CommentsSection";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const postQuery = usePostDetail(postId);
  usePostRealtime(postId);

  const commentsQuery = usePostComments(postId, 50);
  const createComment = useCreateComment(postId ?? "");
  const updateComment = useUpdateComment(postId ?? "");
  const deleteComment = useDeleteComment(postId ?? "");
  const toggleLike = useTogglePostLike(postId ?? "");

  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const post = postQuery.data;

  const onSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || !postId || !commentDraft.trim()) {
      return;
    }

    await createComment.mutateAsync({
      authorId: user.id,
      input: {
        postId,
        body: commentDraft.trim(),
      },
    });
    setCommentDraft("");
  };

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

      <CommentsSection
        canComment={Boolean(user)}
        comments={commentsQuery.data?.items ?? []}
        isLoading={commentsQuery.isLoading}
        isError={commentsQuery.isError}
        createPending={createComment.isPending}
        updatePending={updateComment.isPending}
        deletePending={deleteComment.isPending}
        commentDraft={commentDraft}
        editingCommentId={editingCommentId}
        editingText={editingText}
        viewerId={user?.id ?? null}
        onCommentDraftChange={setCommentDraft}
        onSubmitComment={onSubmitComment}
        onRequireSignIn={() => navigate(ROUTE_PATHS.authLogin)}
        onStartEdit={(comment: CommentItem) => {
          setEditingCommentId(comment.id);
          setEditingText(comment.body);
        }}
        onCancelEdit={() => {
          setEditingCommentId(null);
          setEditingText("");
        }}
        onEditingTextChange={setEditingText}
        onSaveEdit={(event: FormEvent<HTMLFormElement>, commentId: string) => {
          event.preventDefault();
          if (!user?.id || !editingText.trim()) {
            return;
          }

          void updateComment
            .mutateAsync({
              commentId,
              authorId: user.id,
              input: { body: editingText.trim() },
            })
            .then(() => {
              setEditingCommentId(null);
              setEditingText("");
            });
        }}
        onDeleteComment={(commentId: string) => {
          if (!user?.id) {
            return;
          }

          void deleteComment.mutateAsync({
            commentId,
            authorId: user.id,
          });
        }}
      />
    </div>
  );
}

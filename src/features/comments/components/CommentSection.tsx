import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import type { CommentItem } from "../../../entities/comment/types";
import { commentsRepository } from "../../../repositories/supabase";
import { ROUTE_PATHS } from "../../../app/router/paths";
import { supabase } from "../../../shared/lib/supabase/supabaseClient";
import { FormErrorText } from "../../../shared/ui/FormErrorText";

interface CommentSectionProps {
  postId: string;
  limit?: number;
}

function formatTimestamp(isoValue: string): string {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return isoValue;
  }

  return date.toLocaleString();
}

function sortByCreatedAtAsc(comments: CommentItem[]): CommentItem[] {
  return [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function CommentSection({ postId, limit = 50 }: CommentSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [commentDraft, setCommentDraft] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const commentsQuery = useQuery({
    queryKey: ["comments", "post", postId, limit, null],
    queryFn: () => commentsRepository.listByPost(postId, { limit, cursor: null }),
    enabled: Boolean(postId),
  });

  const comments = useMemo(() => {
    const items = commentsQuery.data?.items ?? [];
    return sortByCreatedAtAsc(items);
  }, [commentsQuery.data]);

  const invalidatePostData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] }),
      queryClient.invalidateQueries({ queryKey: ["posts", "detail", postId] }),
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
    ]);
  };

  const createComment = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("You must be signed in to comment.");
      }

      const body = commentDraft.trim();
      if (!body) {
        throw new Error("Comment cannot be empty.");
      }

      return commentsRepository.create(user.id, {
        postId,
        body,
      });
    },
    onSuccess: async () => {
      setCommentDraft("");
      await invalidatePostData();
    },
    onError: (error) => {
      if (error instanceof Error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Failed to add comment. Please try again.");
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
      if (!user?.id) {
        throw new Error("You must be signed in to edit comments.");
      }

      const nextBody = body.trim();
      if (!nextBody) {
        throw new Error("Comment cannot be empty.");
      }

      return commentsRepository.update(commentId, user.id, { body: nextBody });
    },
    onSuccess: async () => {
      setEditingCommentId(null);
      setEditingText("");
      await queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setActionError(error.message);
        return;
      }

      setActionError("Failed to update comment. Please try again.");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async ({ commentId }: { commentId: string }) => {
      if (!user?.id) {
        throw new Error("You must be signed in to delete comments.");
      }

      await commentsRepository.remove(commentId, user.id);
    },
    onSuccess: async () => {
      await invalidatePostData();
    },
    onError: (error) => {
      if (error instanceof Error) {
        setActionError(error.message);
        return;
      }

      setActionError("Failed to delete comment. Please try again.");
    },
  });

  useEffect(() => {
    if (!postId) {
      return;
    }

    const channel = supabase
      .channel(`comments:post:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const onSubmitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    void createComment.mutateAsync();
  };

  const onStartEdit = (comment: CommentItem) => {
    setActionError(null);
    setEditingCommentId(comment.id);
    setEditingText(comment.body);
  };

  const onCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const onSaveEdit = (event: FormEvent<HTMLFormElement>, commentId: string) => {
    event.preventDefault();
    setActionError(null);
    void updateComment.mutateAsync({ commentId, body: editingText });
  };

  const onDeleteComment = (commentId: string) => {
    setActionError(null);
    void deleteComment.mutateAsync({ commentId });
  };

  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <h2 style={{ margin: 0 }}>Comments</h2>

      {user ? (
        <form onSubmit={onSubmitComment} style={{ display: "grid", gap: "8px" }}>
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            rows={4}
            placeholder="Write your comment"
            minLength={1}
            maxLength={4000}
          />
          <button type="submit" disabled={createComment.isPending || !commentDraft.trim()}>
            {createComment.isPending ? "Posting..." : "Add Comment"}
          </button>
          <FormErrorText>{submitError}</FormErrorText>
        </form>
      ) : (
        <button type="button" onClick={() => navigate(ROUTE_PATHS.authLogin)}>
          Sign in to comment
        </button>
      )}

      {commentsQuery.isLoading ? <div>Loading comments...</div> : null}
      <FormErrorText>{commentsQuery.isError ? "Failed to load comments." : null}</FormErrorText>
      <FormErrorText>{actionError}</FormErrorText>

      {comments.map((comment) => {
        const isOwner = user?.id === comment.author.userId;
        const isEditing = editingCommentId === comment.id;

        return (
          <article key={comment.id} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={`${comment.author.nickname} avatar`}
                  width={28}
                  height={28}
                  style={{ borderRadius: "9999px", objectFit: "cover" }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "9999px",
                    display: "grid",
                    placeItems: "center",
                    background: "#e2e8f0",
                    color: "#334155",
                    fontSize: "12px",
                  }}
                >
                  {comment.author.nickname.slice(0, 1).toUpperCase()}
                </div>
              )}
              <strong>{comment.author.nickname}</strong>
              <time dateTime={comment.createdAt} style={{ color: "#64748b", fontSize: "13px" }}>
                {formatTimestamp(comment.createdAt)}
              </time>
            </div>

            {isEditing ? (
              <form onSubmit={(event) => onSaveEdit(event, comment.id)} style={{ display: "grid", gap: "8px" }}>
                <textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={3} maxLength={4000} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" disabled={updateComment.isPending || !editingText.trim()}>
                    {updateComment.isPending ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={onCancelEdit} disabled={updateComment.isPending}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{comment.body}</p>
            )}

            {isOwner && !isEditing ? (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button type="button" onClick={() => onStartEdit(comment)} disabled={deleteComment.isPending || updateComment.isPending}>
                  Edit
                </button>
                <button type="button" onClick={() => onDeleteComment(comment.id)} disabled={deleteComment.isPending || updateComment.isPending}>
                  {deleteComment.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

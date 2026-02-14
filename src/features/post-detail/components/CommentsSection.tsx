import type { FormEvent } from "react";
import type { CommentItem } from "../../../entities/comment/types";

interface CommentsSectionProps {
  canComment: boolean;
  comments: CommentItem[];
  isLoading: boolean;
  isError: boolean;
  createPending: boolean;
  updatePending: boolean;
  deletePending: boolean;
  commentDraft: string;
  editingCommentId: string | null;
  editingText: string;
  viewerId: string | null;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: (event: FormEvent<HTMLFormElement>) => void;
  onRequireSignIn: () => void;
  onStartEdit: (comment: CommentItem) => void;
  onCancelEdit: () => void;
  onEditingTextChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>, commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function CommentsSection({
  canComment,
  comments,
  isLoading,
  isError,
  createPending,
  updatePending,
  deletePending,
  commentDraft,
  editingCommentId,
  editingText,
  viewerId,
  onCommentDraftChange,
  onSubmitComment,
  onRequireSignIn,
  onStartEdit,
  onCancelEdit,
  onEditingTextChange,
  onSaveEdit,
  onDeleteComment,
}: CommentsSectionProps) {
  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <h2 style={{ margin: 0 }}>Comments</h2>

      {canComment ? (
        <form onSubmit={onSubmitComment} style={{ display: "grid", gap: "8px" }}>
          <textarea
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            rows={4}
            placeholder="Write your comment"
          />
          <button type="submit" disabled={createPending || !commentDraft.trim()}>
            Add Comment
          </button>
        </form>
      ) : (
        <button type="button" onClick={onRequireSignIn}>
          Sign in to comment
        </button>
      )}

      {isLoading ? <div>Loading comments...</div> : null}
      {isError ? <div>Failed to load comments.</div> : null}

      {comments.map((comment) => {
        const isOwner = viewerId === comment.author.userId;
        const isEditing = editingCommentId === comment.id;

        return (
          <article key={comment.id} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px" }}>
            <div style={{ fontSize: "14px", color: "#475569" }}>{comment.author.nickname}</div>
            {isEditing ? (
              <form onSubmit={(event) => onSaveEdit(event, comment.id)} style={{ display: "grid", gap: "8px" }}>
                <textarea value={editingText} onChange={(event) => onEditingTextChange(event.target.value)} rows={3} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" disabled={updatePending || !editingText.trim()}>
                    Save
                  </button>
                  <button type="button" onClick={onCancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ whiteSpace: "pre-wrap" }}>{comment.body}</p>
            )}

            {isOwner && !isEditing ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => onStartEdit(comment)}>
                  Edit
                </button>
                <button type="button" onClick={() => onDeleteComment(comment.id)} disabled={deletePending}>
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

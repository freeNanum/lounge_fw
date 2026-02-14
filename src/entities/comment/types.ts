import type { ProfilePreview } from "../profile/types";

export interface CommentItem {
  id: string;
  postId: string;
  author: ProfilePreview;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  postId: string;
  body: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentInput {
  body: string;
}

import type { UserId } from "../profile/types";

export interface PostLike {
  postId: string;
  userId: UserId;
  createdAt: string;
}

export interface PostLikeStatus {
  postId: string;
  likedByViewer: boolean;
  likeCount: number;
}

export interface ToggleLikeResult {
  postId: string;
  likedByViewer: boolean;
  likeCount: number;
}

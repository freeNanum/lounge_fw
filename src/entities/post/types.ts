import type { ProfilePreview } from "../profile/types";
import type { Tag } from "../tag/types";

export type PostType = "question" | "info";

export type PostSort = "latest" | "popular";

export interface PostSummary {
  id: string;
  type: PostType;
  title: string;
  excerpt: string;
  author: ProfilePreview;
  tags: Tag[];
  commentCount: number;
  likeCount: number;
  isLikedByViewer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail {
  id: string;
  type: PostType;
  title: string;
  body: string;
  author: ProfilePreview;
  tags: Tag[];
  commentCount: number;
  likeCount: number;
  isLikedByViewer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  type: PostType;
  title: string;
  body: string;
  tagNames: string[];
}

export interface UpdatePostInput {
  type?: PostType;
  title?: string;
  body?: string;
  tagNames?: string[];
}

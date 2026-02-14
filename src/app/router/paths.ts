import type { PostSort, PostType } from "../../entities/post/types";

export const ROUTE_PATHS = {
  home: "/",
  postDetail: "/posts/:postId",
  postEdit: "/posts/:postId/edit",
  write: "/write",
  tags: "/tags/:tagName",
  search: "/search",
  myPage: "/me",
  settings: "/settings",
  authLogin: "/auth/login",
  authCallback: "/auth/callback",
} as const;

export type RoutePathKey = keyof typeof ROUTE_PATHS;

export interface FeedQueryParams {
  type?: PostType;
  tags?: string[];
  tag?: string;
  q?: string;
  sort?: PostSort;
}

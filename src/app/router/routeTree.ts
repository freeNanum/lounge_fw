import { ROUTE_PATHS } from "./paths";

export type RouteAccess = "public" | "authenticated" | "owner";

export interface AppRouteNode {
  id: string;
  path: string;
  access: RouteAccess;
  description: string;
  children?: AppRouteNode[];
}

export const APP_ROUTE_TREE: AppRouteNode[] = [
  {
    id: "root",
    path: ROUTE_PATHS.home,
    access: "public",
    description: "Community feed with tag/type/search filters",
    children: [
      {
        id: "post-detail",
        path: ROUTE_PATHS.postDetail,
        access: "public",
        description: "Post detail with comments and like actions",
      },
      {
        id: "tag-feed",
        path: ROUTE_PATHS.tags,
        access: "public",
        description: "Feed filtered by tag",
      },
      {
        id: "search",
        path: ROUTE_PATHS.search,
        access: "public",
        description: "Search results page",
      },
    ],
  },
  {
    id: "auth-login",
    path: ROUTE_PATHS.authLogin,
    access: "public",
    description: "Login page",
  },
  {
    id: "auth-callback",
    path: ROUTE_PATHS.authCallback,
    access: "public",
    description: "OAuth callback",
  },
  {
    id: "write",
    path: ROUTE_PATHS.write,
    access: "authenticated",
    description: "Create new post",
  },
  {
    id: "post-edit",
    path: ROUTE_PATHS.postEdit,
    access: "owner",
    description: "Edit existing post (owner only)",
  },
  {
    id: "my-page",
    path: ROUTE_PATHS.myPage,
    access: "authenticated",
    description: "My activity and authored content",
  },
  {
    id: "settings",
    path: ROUTE_PATHS.settings,
    access: "authenticated",
    description: "Profile and account settings",
  },
];

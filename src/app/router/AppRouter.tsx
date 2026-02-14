import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTE_PATHS } from "./paths";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { RequireAuth } from "./guards/RequireAuth";
import { RequirePostOwner } from "./guards/RequirePostOwner";
import { HomePage } from "../../pages/HomePage/index";
import { PostDetailPage } from "../../pages/PostDetailPage/index";
import { SearchPage } from "../../pages/SearchPage/index";
import { WritePage } from "../../pages/WritePage/index";
import { MyPage } from "../../pages/MyPage/index";
import { SettingsPage } from "../../pages/SettingsPage/index";
import { PostEditPage } from "../../pages/PostEditPage/index";
import { LoginPage } from "../../pages/LoginPage/index";
import { AuthCallbackPage } from "../../pages/AuthCallbackPage/index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "posts/:postId", element: <PostDetailPage /> },
      { path: "search", element: <SearchPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "write", element: <WritePage /> },
          { path: "me", element: <MyPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      {
        element: <RequirePostOwner />,
        children: [{ path: "posts/:postId/edit", element: <PostEditPage /> }],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTE_PATHS.authLogin, element: <LoginPage /> },
      { path: ROUTE_PATHS.authCallback, element: <AuthCallbackPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

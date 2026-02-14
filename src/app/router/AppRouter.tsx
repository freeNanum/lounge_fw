import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTE_PATHS } from "./paths";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { HomePage } from "../../pages/HomePage/index";
import { PostDetailPage } from "../../pages/PostDetailPage/index";
import { SearchPage } from "../../pages/SearchPage/index";
import { WritePage } from "../../pages/WritePage/index";
import { MyPage } from "../../pages/MyPage/index";
import { SettingsPage } from "../../pages/SettingsPage/index";
import { LoginPage } from "../../pages/LoginPage/index";
import { AuthCallbackPage } from "../../pages/AuthCallbackPage/index";

const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.home,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTE_PATHS.postDetail, element: <PostDetailPage /> },
      { path: ROUTE_PATHS.search, element: <SearchPage /> },
      { path: ROUTE_PATHS.write, element: <WritePage /> },
      { path: ROUTE_PATHS.myPage, element: <MyPage /> },
      { path: ROUTE_PATHS.settings, element: <SettingsPage /> },
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

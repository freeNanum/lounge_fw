import { Navigate, Outlet, generatePath, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ROUTE_PATHS } from "../paths";
import { useAuth } from "../../../features/auth/AuthProvider";
import { postsRepository } from "../../../repositories/supabase";

export function RequirePostOwner() {
  const { isInitializing, user } = useAuth();
  const location = useLocation();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;

  const { data: post, isLoading } = useQuery({
    queryKey: ["posts", "detail", postId, user?.id ?? null],
    queryFn: () =>
      postsRepository.getById(postId as string, {
        viewerId: user?.id ?? null,
      }),
    enabled: Boolean(user?.id && postId),
  });

  if (isInitializing) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTE_PATHS.authLogin} replace state={{ from: location }} />;
  }

  if (isLoading) {
    return <div>Checking ownership...</div>;
  }

  if (!postId) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  if (!post) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  if (post.author.userId !== user.id) {
    return <Navigate to={generatePath(ROUTE_PATHS.postDetail, { postId })} replace />;
  }

  return <Outlet />;
}

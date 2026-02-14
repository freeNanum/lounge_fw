import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostLikeStatus, ToggleLikeResult } from "../../entities/like/types";
import type { PostDetail, PostSummary } from "../../entities/post/types";
import type { CursorPage } from "../../repositories/interfaces/common";
import { likesRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

function resolveNextLikeCount(currentCount: number, currentLikedByViewer: boolean, nextLikedByViewer: boolean): number {
  if (currentLikedByViewer === nextLikedByViewer) {
    return currentCount;
  }

  const delta = nextLikedByViewer ? 1 : -1;
  return Math.max(0, currentCount + delta);
}

function applyLikeStateToDetail(post: PostDetail, nextLikedByViewer: boolean): PostDetail {
  return {
    ...post,
    likeCount: resolveNextLikeCount(post.likeCount, post.isLikedByViewer, nextLikedByViewer),
    isLikedByViewer: nextLikedByViewer,
  };
}

function applyLikeStateToSummary(post: PostSummary, nextLikedByViewer: boolean): PostSummary {
  return {
    ...post,
    likeCount: resolveNextLikeCount(post.likeCount, post.isLikedByViewer, nextLikedByViewer),
    isLikedByViewer: nextLikedByViewer,
  };
}

function applyServerResultToDetail(post: PostDetail, result: ToggleLikeResult): PostDetail {
  return {
    ...post,
    likeCount: result.likeCount,
    isLikedByViewer: result.likedByViewer,
  };
}

function applyServerResultToSummary(post: PostSummary, result: ToggleLikeResult): PostSummary {
  return {
    ...post,
    likeCount: result.likeCount,
    isLikedByViewer: result.likedByViewer,
  };
}

export function usePostLikeStatus(postId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["likes", "status", postId, user?.id ?? null],
    queryFn: () => likesRepository.getPostLikeStatus(postId as string, user?.id as string),
    enabled: Boolean(postId && user?.id),
  });
}

export function useTogglePostLike(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liked: boolean) => {
      if (!user?.id) {
        throw new Error("Login required");
      }

      if (liked) {
        return likesRepository.unlike(postId, user.id);
      }

      return likesRepository.like(postId, user.id);
    },
    onMutate: async (liked) => {
      const nextLikedByViewer = !liked;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["likes", "status", postId] }),
        queryClient.cancelQueries({ queryKey: ["posts", "detail", postId] }),
        queryClient.cancelQueries({ queryKey: ["posts", "feed"] }),
      ]);

      const previousLikeStatus = queryClient.getQueriesData<PostLikeStatus>({ queryKey: ["likes", "status", postId] });
      const previousPostDetails = queryClient.getQueriesData<PostDetail | null>({ queryKey: ["posts", "detail", postId] });
      const previousFeeds = queryClient.getQueriesData<CursorPage<PostSummary>>({ queryKey: ["posts", "feed"] });

      queryClient.setQueriesData<PostLikeStatus>({ queryKey: ["likes", "status", postId] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          likedByViewer: nextLikedByViewer,
          likeCount: resolveNextLikeCount(previous.likeCount, previous.likedByViewer, nextLikedByViewer),
        };
      });

      queryClient.setQueriesData<PostDetail | null>({ queryKey: ["posts", "detail", postId] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return applyLikeStateToDetail(previous, nextLikedByViewer);
      });

      queryClient.setQueriesData<CursorPage<PostSummary>>({ queryKey: ["posts", "feed"] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.map((post) =>
            post.id === postId ? applyLikeStateToSummary(post, nextLikedByViewer) : post
          ),
        };
      });

      return {
        previousLikeStatus,
        previousPostDetails,
        previousFeeds,
      };
    },
    onError: (_error, _liked, context) => {
      context?.previousLikeStatus.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      context?.previousPostDetails.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      context?.previousFeeds.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (result) => {
      queryClient.setQueriesData<PostLikeStatus>({ queryKey: ["likes", "status", postId] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          likedByViewer: result.likedByViewer,
          likeCount: result.likeCount,
        };
      });

      queryClient.setQueriesData<PostDetail | null>({ queryKey: ["posts", "detail", postId] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return applyServerResultToDetail(previous, result);
      });

      queryClient.setQueriesData<CursorPage<PostSummary>>({ queryKey: ["posts", "feed"] }, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          items: previous.items.map((post) => (post.id === postId ? applyServerResultToSummary(post, result) : post)),
        };
      });
    },
    onSettled: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["likes", "status", postId] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "detail", postId] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
      ]).then(() => undefined);
    },
  });
}

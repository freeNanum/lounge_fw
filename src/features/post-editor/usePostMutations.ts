import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePostInput, UpdatePostInput } from "../../entities/post/types";
import { postsRepository } from "../../repositories/supabase";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreatePostInput }) =>
      postsRepository.create(authorId, input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      authorId,
      input,
    }: {
      postId: string;
      authorId: string;
      input: UpdatePostInput;
    }) => postsRepository.update(postId, authorId, input),
    onSuccess: (post) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts", "detail", post.id] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
      ]).then(() => undefined);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, authorId }: { postId: string; authorId: string }) =>
      postsRepository.remove(postId, authorId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

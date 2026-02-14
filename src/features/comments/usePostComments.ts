import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCommentInput, UpdateCommentInput } from "../../entities/comment/types";
import { commentsRepository } from "../../repositories/supabase";

export function usePostComments(postId: string | undefined, limit = 20, cursor: string | null = null) {
  return useQuery({
    queryKey: ["comments", "post", postId, limit, cursor],
    queryFn: () => commentsRepository.listByPost(postId as string, { limit, cursor }),
    enabled: Boolean(postId),
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateCommentInput }) =>
      commentsRepository.create(authorId, input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      authorId,
      input,
    }: {
      commentId: string;
      authorId: string;
      input: UpdateCommentInput;
    }) => commentsRepository.update(commentId, authorId, input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, authorId }: { commentId: string; authorId: string }) =>
      commentsRepository.remove(commentId, authorId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] });
    },
  });
}

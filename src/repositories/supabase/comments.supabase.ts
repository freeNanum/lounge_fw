import type { CommentItem, CreateCommentInput, UpdateCommentInput } from "../../entities/comment/types";
import type { CommentsRepository } from "../interfaces/comments.repository";
import type { CursorPage, CursorRequest } from "../interfaces/common";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import {
  CommentRow,
  ProfileRow,
  loadProfilesMap,
  throwIfError,
  toCursor,
  toProfilePreview,
} from "./_shared";

const DEFAULT_LIMIT = 20;

function normalizeLimit(limit: number): number {
  return Math.max(Math.min(limit, 50), 1);
}

class SupabaseCommentsRepository implements CommentsRepository {
  async listByPost(postId: string, query: CursorRequest): Promise<CursorPage<CommentItem>> {
    const limit = normalizeLimit(query.limit || DEFAULT_LIMIT);

    let builder = supabase
      .from("comments")
      .select("id,post_id,author_id,parent_comment_id,body,created_at,updated_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(limit + 1);

    if (query.cursor) {
      builder = builder.gt("created_at", query.cursor);
    }

    const { data, error } = await builder;
    throwIfError(error);

    const rows = (data ?? []) as CommentRow[];
    const sliced = rows.slice(0, limit);
    const authorIds = [...new Set(sliced.map((row) => row.author_id))];
    const profilesMap = await loadProfilesMap(authorIds);

    const items = sliced.map((row) => {
      const profile = profilesMap.get(row.author_id);

      if (!profile) {
        throw new Error(`Profile not found for comment author: ${row.author_id}`);
      }

      return {
        id: row.id,
        postId: row.post_id,
        author: toProfilePreview(profile),
        body: row.body,
        parentCommentId: row.parent_comment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return {
      items,
      nextCursor: rows.length > limit ? toCursor(items[items.length - 1]?.createdAt) : null,
    };
  }

  async create(authorId: string, input: CreateCommentInput): Promise<CommentItem> {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: input.postId,
        author_id: authorId,
        body: input.body,
        parent_comment_id: input.parentCommentId ?? null,
      })
      .select("id,post_id,author_id,parent_comment_id,body,created_at,updated_at")
      .single();

    throwIfError(error);

    const row = data as CommentRow;
    const profilesMap = await loadProfilesMap([row.author_id]);
    const profile = profilesMap.get(row.author_id);

    if (!profile) {
      throw new Error(`Profile not found for comment author: ${row.author_id}`);
    }

    return {
      id: row.id,
      postId: row.post_id,
      author: toProfilePreview(profile as ProfileRow),
      body: row.body,
      parentCommentId: row.parent_comment_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async update(commentId: string, authorId: string, input: UpdateCommentInput): Promise<CommentItem> {
    const { data, error } = await supabase
      .from("comments")
      .update({ body: input.body })
      .eq("id", commentId)
      .eq("author_id", authorId)
      .select("id,post_id,author_id,parent_comment_id,body,created_at,updated_at")
      .single();

    throwIfError(error);

    const row = data as CommentRow;
    const profilesMap = await loadProfilesMap([row.author_id]);
    const profile = profilesMap.get(row.author_id);

    if (!profile) {
      throw new Error(`Profile not found for comment author: ${row.author_id}`);
    }

    return {
      id: row.id,
      postId: row.post_id,
      author: toProfilePreview(profile),
      body: row.body,
      parentCommentId: row.parent_comment_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async remove(commentId: string, authorId: string): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("author_id", authorId);

    throwIfError(error);
  }
}

export const commentsRepository: CommentsRepository = new SupabaseCommentsRepository();

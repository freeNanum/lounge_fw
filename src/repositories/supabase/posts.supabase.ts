import type {
  CreatePostInput,
  PostDetail,
  PostSummary,
  UpdatePostInput,
} from "../../entities/post/types";
import type { CursorPage } from "../interfaces/common";
import type { ListPostsQuery, PostsRepository } from "../interfaces/posts.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import {
  PostRow,
  loadLikedPostIdSet,
  loadProfilesMap,
  loadTagsByPostIds,
  throwIfError,
  toCursor,
  toProfilePreview,
} from "./_shared";
import { tagsRepository } from "./tags.supabase";

const DEFAULT_LIMIT = 20;

function normalizeLimit(limit: number): number {
  return Math.max(Math.min(limit, 50), 1);
}

function toExcerpt(body: string): string {
  if (body.length <= 180) {
    return body;
  }

  return `${body.slice(0, 180)}...`;
}

class SupabasePostsRepository implements PostsRepository {
  async listFeed(query: ListPostsQuery, context?: { viewerId?: string | null }): Promise<CursorPage<PostSummary>> {
    const limit = normalizeLimit(query.limit || DEFAULT_LIMIT);

    let builder = supabase
      .from("posts")
      .select("id,author_id,type,title,body,comment_count,like_count,created_at,updated_at")
      .limit(limit + 1);

    if (query.type) {
      builder = builder.eq("type", query.type);
    }

    if (query.q) {
      builder = builder.textSearch("search_vector", query.q, { type: "websearch" });
    }

    if (query.cursor) {
      builder = builder.lt("created_at", query.cursor);
    }

    if (query.sort === "popular") {
      builder = builder.order("like_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
      builder = builder.order("created_at", { ascending: false });
    }

    if (query.tag) {
      const { data: tagRow, error: tagError } = await supabase
        .from("tags")
        .select("id")
        .eq("name", query.tag.toLowerCase())
        .maybeSingle();

      throwIfError(tagError);

      if (!tagRow) {
        return { items: [], nextCursor: null };
      }

      const { data: postTagRows, error: postTagError } = await supabase
        .from("post_tags")
        .select("post_id")
        .eq("tag_id", (tagRow as { id: string }).id);
      throwIfError(postTagError);

      const postIds = [...new Set(((postTagRows ?? []) as Array<{ post_id: string }>).map((row) => row.post_id))];
      if (postIds.length === 0) {
        return { items: [], nextCursor: null };
      }

      builder = builder.in("id", postIds);
    }

    const { data, error } = await builder;
    throwIfError(error);

    const rows = (data ?? []) as PostRow[];
    const sliced = rows.slice(0, limit);

    return this.toPostSummaryPage(sliced, rows.length > limit, context?.viewerId ?? null);
  }

  async listByTag(
    tagName: string,
    query: { limit: number; cursor?: string | null },
    context?: { viewerId?: string | null }
  ): Promise<CursorPage<PostSummary>> {
    return this.listFeed(
      {
        ...query,
        tag: tagName,
      },
      context
    );
  }

  async search(
    queryText: string,
    query: { limit: number; cursor?: string | null },
    context?: { viewerId?: string | null }
  ): Promise<CursorPage<PostSummary>> {
    return this.listFeed(
      {
        ...query,
        q: queryText,
      },
      context
    );
  }

  async getById(postId: string, context?: { viewerId?: string | null }): Promise<PostDetail | null> {
    const { data, error } = await supabase
      .from("posts")
      .select("id,author_id,type,title,body,comment_count,like_count,created_at,updated_at")
      .eq("id", postId)
      .maybeSingle();

    throwIfError(error);

    if (!data) {
      return null;
    }

    const row = data as PostRow;
    const [profilesMap, tagsMap, likedSet] = await Promise.all([
      loadProfilesMap([row.author_id]),
      loadTagsByPostIds([row.id]),
      loadLikedPostIdSet([row.id], context?.viewerId ?? null),
    ]);

    const profile = profilesMap.get(row.author_id);
    if (!profile) {
      throw new Error(`Profile not found for post author: ${row.author_id}`);
    }

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      author: toProfilePreview(profile),
      tags: tagsMap.get(row.id) ?? [],
      commentCount: row.comment_count,
      likeCount: row.like_count,
      isLikedByViewer: likedSet.has(row.id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(authorId: string, input: CreatePostInput): Promise<PostDetail> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: authorId,
        type: input.type,
        title: input.title,
        body: input.body,
      })
      .select("id,author_id,type,title,body,comment_count,like_count,created_at,updated_at")
      .single();

    throwIfError(error);

    const postRow = data as PostRow;
    const tags = await tagsRepository.replaceForOwnedPost(postRow.id, authorId, input.tagNames);

    const detail = await this.getById(postRow.id, { viewerId: authorId });
    if (!detail) {
      throw new Error("Created post not found");
    }

    return {
      ...detail,
      tags,
    };
  }

  async update(postId: string, authorId: string, input: UpdatePostInput): Promise<PostDetail> {
    const payload: Record<string, string> = {};
    if (input.type !== undefined) {
      payload.type = input.type;
    }
    if (input.title !== undefined) {
      payload.title = input.title;
    }
    if (input.body !== undefined) {
      payload.body = input.body;
    }

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from("posts").update(payload).eq("id", postId).eq("author_id", authorId);
      throwIfError(error);
    }

    if (input.tagNames) {
      await tagsRepository.replaceForOwnedPost(postId, authorId, input.tagNames);
    }

    const detail = await this.getById(postId, { viewerId: authorId });
    if (!detail) {
      throw new Error("Updated post not found");
    }

    return detail;
  }

  async remove(postId: string, authorId: string): Promise<void> {
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", authorId);
    throwIfError(error);
  }

  private async toPostSummaryPage(
    rows: PostRow[],
    hasMore: boolean,
    viewerId: string | null
  ): Promise<CursorPage<PostSummary>> {
    const authorIds = [...new Set(rows.map((row) => row.author_id))];
    const postIds = rows.map((row) => row.id);

    const [profilesMap, tagsMap, likedSet] = await Promise.all([
      loadProfilesMap(authorIds),
      loadTagsByPostIds(postIds),
      loadLikedPostIdSet(postIds, viewerId),
    ]);

    const items = rows.map((row) => {
      const profile = profilesMap.get(row.author_id);
      if (!profile) {
        throw new Error(`Profile not found for post author: ${row.author_id}`);
      }

      return {
        id: row.id,
        type: row.type,
        title: row.title,
        excerpt: toExcerpt(row.body),
        author: toProfilePreview(profile),
        tags: tagsMap.get(row.id) ?? [],
        commentCount: row.comment_count,
        likeCount: row.like_count,
        isLikedByViewer: likedSet.has(row.id),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return {
      items,
      nextCursor: hasMore ? toCursor(items[items.length - 1]?.createdAt) : null,
    };
  }
}

export const postsRepository: PostsRepository = new SupabasePostsRepository();

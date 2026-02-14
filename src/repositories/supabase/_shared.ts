import type { Profile, ProfilePreview } from "../../entities/profile/types";
import type { Tag } from "../../entities/tag/types";
import { supabase } from "../../shared/lib/supabase/supabaseClient";

export interface ProfileRow {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  author_id: string;
  type: "question" | "info";
  title: string;
  body: string;
  comment_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface PostTagRow {
  post_id: string;
  tag_id: string;
}

export interface PostLikeRow {
  post_id: string;
  user_id: string;
  created_at: string;
}

export function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export function toProfilePreview(row: ProfileRow): ProfilePreview {
  return {
    userId: row.user_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
  };
}

export function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function loadProfilesMap(userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,nickname,avatar_url,bio,created_at,updated_at")
    .in("user_id", userIds);

  throwIfError(error);

  const rows = (data ?? []) as ProfileRow[];
  return new Map(rows.map((row) => [row.user_id, row]));
}

export async function loadTagsByPostIds(postIds: string[]): Promise<Map<string, Tag[]>> {
  if (postIds.length === 0) {
    return new Map<string, Tag[]>();
  }

  const { data: postTagRows, error: postTagError } = await supabase
    .from("post_tags")
    .select("post_id,tag_id")
    .in("post_id", postIds);

  throwIfError(postTagError);

  const links = (postTagRows ?? []) as PostTagRow[];
  const tagIds = [...new Set(links.map((item) => item.tag_id))];

  if (tagIds.length === 0) {
    return new Map(postIds.map((postId) => [postId, []]));
  }

  const { data: tagRows, error: tagError } = await supabase
    .from("tags")
    .select("id,name,description,created_at")
    .in("id", tagIds);

  throwIfError(tagError);

  const tagsById = new Map(((tagRows ?? []) as TagRow[]).map((row) => [row.id, toTag(row)]));
  const map = new Map<string, Tag[]>(postIds.map((postId) => [postId, []]));

  for (const link of links) {
    const tag = tagsById.get(link.tag_id);
    if (!tag) {
      continue;
    }

    const items = map.get(link.post_id);
    if (!items) {
      continue;
    }

    items.push(tag);
  }

  return map;
}

export async function loadLikedPostIdSet(postIds: string[], viewerId?: string | null): Promise<Set<string>> {
  if (!viewerId || postIds.length === 0) {
    return new Set<string>();
  }

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", viewerId)
    .in("post_id", postIds);

  throwIfError(error);

  const rows = (data ?? []) as Array<{ post_id: string }>;
  return new Set(rows.map((row) => row.post_id));
}

export function toCursor(createdAt: string | undefined): string | null {
  return createdAt ?? null;
}

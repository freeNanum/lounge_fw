export interface CursorRequest {
  limit: number;
  cursor?: string | null;
}

export interface CursorPage<TItem> {
  items: TItem[];
  nextCursor: string | null;
}

export interface RequestContext {
  viewerId?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TagSummary {
  id: string;
  name: string;
  postCount: number;
}

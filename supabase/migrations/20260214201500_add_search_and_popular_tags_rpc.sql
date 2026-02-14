create or replace function public.search_posts(
  p_query text,
  p_limit integer default 20,
  p_cursor timestamptz default null,
  p_type public.post_type default null,
  p_tag text default null
)
returns table (
  id uuid,
  author_id uuid,
  type public.post_type,
  title text,
  body text,
  comment_count integer,
  like_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
as $$
  select
    p.id,
    p.author_id,
    p.type,
    p.title,
    p.body,
    p.comment_count,
    p.like_count,
    p.created_at,
    p.updated_at
  from public.posts p
  where
    (p_query is null or p_query = '' or p.search_vector @@ websearch_to_tsquery('simple', p_query))
    and (p_type is null or p.type = p_type)
    and (
      p_tag is null
      or exists (
        select 1
        from public.post_tags pt
        join public.tags t on t.id = pt.tag_id
        where pt.post_id = p.id
          and t.name = lower(p_tag)
      )
    )
    and (p_cursor is null or p.created_at < p_cursor)
  order by p.created_at desc
  limit greatest(least(coalesce(p_limit, 20), 50), 1);
$$;

grant execute on function public.search_posts(text, integer, timestamptz, public.post_type, text) to anon;
grant execute on function public.search_posts(text, integer, timestamptz, public.post_type, text) to authenticated;

create or replace function public.list_popular_tags(
  p_limit integer default 10
)
returns table (
  id uuid,
  name text,
  post_count bigint
)
language sql
stable
as $$
  select
    t.id,
    t.name,
    count(pt.post_id) as post_count
  from public.tags t
  left join public.post_tags pt on pt.tag_id = t.id
  group by t.id, t.name
  order by post_count desc, t.name asc
  limit greatest(least(coalesce(p_limit, 10), 100), 1);
$$;

grant execute on function public.list_popular_tags(integer) to anon;
grant execute on function public.list_popular_tags(integer) to authenticated;

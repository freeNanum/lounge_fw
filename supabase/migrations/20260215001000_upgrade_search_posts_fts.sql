drop function if exists public.search_posts(text, integer, timestamptz, public.post_type, text);

create or replace function public.search_posts(
  p_query text,
  p_limit integer default 20,
  p_cursor timestamptz default null,
  p_type public.post_type default null,
  p_tags text[] default null
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
  with normalized as (
    select
      case
        when p_query is null or btrim(p_query) = '' then null::tsquery
        else websearch_to_tsquery('simple', p_query)
      end as ts_query,
      (
        select coalesce(array_agg(distinct lower(trim(tag_name))), array[]::text[])
        from unnest(coalesce(p_tags, array[]::text[])) as tag_name
        where trim(tag_name) <> ''
      ) as tag_names
  )
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
  cross join normalized n
  where
    (n.ts_query is null or p.search_vector @@ n.ts_query)
    and (p_type is null or p.type = p_type)
    and (
      coalesce(array_length(n.tag_names, 1), 0) = 0
      or not exists (
        select 1
        from unnest(n.tag_names) as required(tag_name)
        where not exists (
          select 1
          from public.post_tags pt
          join public.tags t on t.id = pt.tag_id
          where pt.post_id = p.id
            and t.name = required.tag_name
        )
      )
    )
    and (p_cursor is null or p.created_at < p_cursor)
  order by
    case
      when n.ts_query is null then 0
      else ts_rank_cd(p.search_vector, n.ts_query)
    end desc,
    p.created_at desc
  limit greatest(least(coalesce(p_limit, 20), 50), 1);
$$;

grant execute on function public.search_posts(text, integer, timestamptz, public.post_type, text[]) to anon;
grant execute on function public.search_posts(text, integer, timestamptz, public.post_type, text[]) to authenticated;

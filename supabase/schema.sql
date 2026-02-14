create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'post_type'
      and n.nspname = 'public'
  ) then
    create type public.post_type as enum ('question', 'info');
  end if;
end
$$;

create or replace function public.increment_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set comment_count = comment_count + 1
  where id = new.post_id;

  return new;
end;
$$;

create or replace function public.decrement_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set comment_count = greatest(comment_count - 1, 0)
  where id = old.post_id;

  return old;
end;
$$;

create or replace function public.increment_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set like_count = like_count + 1
  where id = new.post_id;

  return new;
end;
$$;

create or replace function public.decrement_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set like_count = greatest(like_count - 1, 0)
  where id = old.post_id;

  return old;
end;
$$;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  avatar_url text,
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(nickname) between 2 and 30),
  check (char_length(bio) <= 300)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  type public.post_type not null,
  title text not null,
  body text not null,
  comment_count integer not null default 0,
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored,
  check (char_length(title) between 3 and 200),
  check (char_length(body) between 10 and 20000),
  check (comment_count >= 0),
  check (like_count >= 0)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(body) between 1 and 4000)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now(),
  check (name = lower(name)),
  check (char_length(name) between 2 and 30),
  check (char_length(description) <= 200)
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_created_at_desc on public.posts(created_at desc);
create index if not exists idx_posts_type_created_at_desc on public.posts(type, created_at desc);
create index if not exists idx_posts_search_vector on public.posts using gin(search_vector);

create index if not exists idx_comments_post_id_created_at on public.comments(post_id, created_at);
create index if not exists idx_comments_author_id on public.comments(author_id);
create index if not exists idx_comments_parent_comment_id on public.comments(parent_comment_id);

create index if not exists idx_post_tags_tag_id_post_id on public.post_tags(tag_id, post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nickname', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.increment_post_comment_count()
returns trigger
language plpgsql
as $$
begin
  update public.posts
  set comment_count = comment_count + 1
  where id = new.post_id;

  return new;
end;
$$;

create or replace function public.decrement_post_comment_count()
returns trigger
language plpgsql
as $$
begin
  update public.posts
  set comment_count = greatest(comment_count - 1, 0)
  where id = old.post_id;

  return old;
end;
$$;

drop trigger if exists comments_after_insert on public.comments;
create trigger comments_after_insert
after insert on public.comments
for each row
execute function public.increment_post_comment_count();

drop trigger if exists comments_after_delete on public.comments;
create trigger comments_after_delete
after delete on public.comments
for each row
execute function public.decrement_post_comment_count();

create or replace function public.increment_post_like_count()
returns trigger
language plpgsql
as $$
begin
  update public.posts
  set like_count = like_count + 1
  where id = new.post_id;

  return new;
end;
$$;

create or replace function public.decrement_post_like_count()
returns trigger
language plpgsql
as $$
begin
  update public.posts
  set like_count = greatest(like_count - 1, 0)
  where id = old.post_id;

  return old;
end;
$$;

drop trigger if exists post_likes_after_insert on public.post_likes;
create trigger post_likes_after_insert
after insert on public.post_likes
for each row
execute function public.increment_post_like_count();

drop trigger if exists post_likes_after_delete on public.post_likes;
create trigger post_likes_after_delete
after delete on public.post_likes
for each row
execute function public.decrement_post_like_count();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists profiles_read_all on public.profiles;
create policy profiles_read_all
on public.profiles
for select
using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists posts_read_all on public.posts;
create policy posts_read_all
on public.posts
for select
using (true);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own
on public.posts
for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists posts_update_own on public.posts;
create policy posts_update_own
on public.posts
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists posts_delete_own on public.posts;
create policy posts_delete_own
on public.posts
for delete
to authenticated
using ((select auth.uid()) = author_id);

drop policy if exists comments_read_all on public.comments;
create policy comments_read_all
on public.comments
for select
using (true);

drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own
on public.comments
for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists comments_update_own on public.comments;
create policy comments_update_own
on public.comments
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists comments_delete_own on public.comments;
create policy comments_delete_own
on public.comments
for delete
to authenticated
using ((select auth.uid()) = author_id);

drop policy if exists tags_read_all on public.tags;
create policy tags_read_all
on public.tags
for select
using (true);

drop policy if exists tags_insert_authenticated on public.tags;
create policy tags_insert_authenticated
on public.tags
for insert
to authenticated
with check (true);

drop policy if exists post_tags_read_all on public.post_tags;
create policy post_tags_read_all
on public.post_tags
for select
using (true);

drop policy if exists post_tags_insert_post_owner on public.post_tags;
create policy post_tags_insert_post_owner
on public.post_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and p.author_id = (select auth.uid())
  )
);

drop policy if exists post_tags_delete_post_owner on public.post_tags;
create policy post_tags_delete_post_owner
on public.post_tags
for delete
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and p.author_id = (select auth.uid())
  )
);

drop policy if exists post_likes_read_all on public.post_likes;
create policy post_likes_read_all
on public.post_likes
for select
using (true);

drop policy if exists post_likes_insert_own on public.post_likes;
create policy post_likes_insert_own
on public.post_likes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists post_likes_delete_own on public.post_likes;
create policy post_likes_delete_own
on public.post_likes
for delete
to authenticated
using ((select auth.uid()) = user_id);

alter table public.comments replica identity full;
alter table public.post_likes replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'post_likes'
  ) then
    alter publication supabase_realtime add table public.post_likes;
  end if;
end
$$;

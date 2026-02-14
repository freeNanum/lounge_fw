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

-- Surf Signals: lock down Supabase's public Data API.
--
-- Supabase automatically exposes every table in the "public" schema through a REST
-- API (PostgREST) that anyone can call with the project's "anon" key. This app
-- doesn't use that API at all: it connects to Postgres directly as the table owner,
-- which isn't affected by Row Level Security. So switching RLS on with no policies,
-- and revoking the API roles' privileges, closes that door without changing the app.
--
-- Run in the Supabase SQL editor AFTER `npm run db:deploy` (so all tables exist).
-- Safe to run again.

-- 1. What's exposed right now? (rowsecurity = false means readable via the API
--    if the anon/authenticated roles also have privileges)
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
select grantee, table_name, string_agg(privilege_type, ', ') as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by 1, 2 order by 2, 1;

-- 2. Turn on Row Level Security for every table (no policies = API sees nothing)
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 3. Remove the API roles' access to existing and future tables, sequences and functions
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- 4. Check: should show rowsecurity = true everywhere and no rows in the second query
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated');

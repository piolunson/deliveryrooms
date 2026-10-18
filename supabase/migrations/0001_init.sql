-- ============================================================
-- Delivery Rooms — migracja początkowa
-- Wklej w Supabase: Project -> SQL Editor -> New query -> Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'creator' check (role in ('admin','creator')),
  display_name text not null default '',
  avatar_url text,
  storage_limit_bytes bigint not null default 10737418240, -- 10 GB domyślnie
  storage_used_bytes bigint not null default 0,
  must_change_password boolean not null default true,
  is_active boolean not null default true,
  notify_email boolean not null default true,
  notify_digest boolean not null default false,
  hide_powered_by boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- BRAND PRESETS ----------
create table if not exists brand_presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'Domyślny styl',
  logo_url text,
  accent_color text not null default '#2F6FEB',
  font_key text not null default 'garamond' check (font_key in ('garamond','playfair','inter')),
  theme text not null default 'dark' check (theme in ('dark','light')),
  background_type text not null default 'preset' check (background_type in ('image','preset','color')),
  background_value text not null default 'aurora-amber',
  layout text not null default 'grid' check (layout in ('grid','masonry')),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ROOMS ----------
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  client_name text not null,
  client_email text,
  message text,
  cover_file_id uuid,
  co_creators jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','disabled')),
  expires_at timestamptz,
  password_hash text,
  allow_zip boolean not null default true,
  allow_download boolean not null default true,
  brand_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists rooms_owner_idx on rooms(owner_id);
create index if not exists rooms_slug_idx on rooms(slug);

-- ---------- ROOM FILES ----------
create table if not exists room_files (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  storage_path text not null,
  thumb_path text,
  preview_path text,
  original_name text not null,
  mime text not null,
  size_bytes bigint not null default 0,
  width int,
  height int,
  duration_seconds numeric,
  position int not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table rooms
  add constraint rooms_cover_file_fk
  foreign key (cover_file_id) references room_files(id) on delete set null;

create index if not exists room_files_room_idx on room_files(room_id);

-- ---------- FILE REVIEWS (bieżący status pliku) ----------
create table if not exists file_reviews (
  file_id uuid primary key references room_files(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','changes_requested')),
  reviewer_name text,
  updated_at timestamptz not null default now()
);

-- ---------- FILE COMMENTS ----------
create table if not exists file_comments (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references room_files(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  author_type text not null check (author_type in ('client','creator')),
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists file_comments_room_idx on file_comments(room_id);
create index if not exists file_comments_file_idx on file_comments(file_id);

-- ---------- ROOM EVENTS (dziennik aktywności) ----------
create table if not exists room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  file_id uuid references room_files(id) on delete set null,
  type text not null check (type in (
    'opened','downloaded_file','downloaded_zip','approved',
    'changes_requested','commented','reviewed_all'
  )),
  actor_name text,
  ip_hash text,
  user_agent_short text,
  created_at timestamptz not null default now()
);

create index if not exists room_events_room_idx on room_events(room_id);

-- ---------- TESTIMONIALS ----------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null,
  author_name text not null,
  author_role text,
  consent_public boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected','hidden')),
  created_at timestamptz not null default now(),
  moderated_at timestamptz
);

create index if not exists testimonials_status_idx on testimonials(status);

-- ============================================================
-- ROW LEVEL SECURITY — domyślnie wszystko zablokowane
-- ============================================================

alter table profiles enable row level security;
alter table brand_presets enable row level security;
alter table rooms enable row level security;
alter table room_files enable row level security;
alter table file_reviews enable row level security;
alter table file_comments enable row level security;
alter table room_events enable row level security;
alter table testimonials enable row level security;

-- Pomocnicza funkcja: czy zalogowany user jest adminem
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES: użytkownik widzi/edytuje siebie, admin widzi/edytuje wszystkich
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());
create policy "profiles_insert_admin_only" on profiles
  for insert with check (is_admin());
create policy "profiles_delete_admin_only" on profiles
  for delete using (is_admin());

-- BRAND PRESETS: tylko właściciel (+ admin)
create policy "brand_presets_owner" on brand_presets
  for all using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());

-- ROOMS: właściciel i admin mają pełny dostęp przez panel (zalogowani).
-- Dostęp KLIENTA (bez konta) do pojedynczego pokoju idzie WYŁĄCZNIE przez
-- route handlery z kluczem service_role, nigdy bezpośrednio z przeglądarki
-- anon-key — dlatego tu nie dodajemy polityki "select for anon".
create policy "rooms_owner_all" on rooms
  for all using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());

create policy "room_files_owner_all" on room_files
  for all using (
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
  )
  with check (
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
  );

create policy "file_reviews_owner_read" on file_reviews
  for select using (
    exists (
      select 1 from room_files f join rooms r on r.id = f.room_id
      where f.id = file_id and (r.owner_id = auth.uid() or is_admin())
    )
  );

create policy "file_comments_owner_read" on file_comments
  for select using (
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
  );
create policy "file_comments_owner_insert" on file_comments
  for insert with check (
    author_type = 'creator' and
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
  );

create policy "room_events_owner_read" on room_events
  for select using (
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
  );

-- TESTIMONIALS: twórca widzi opinie o swoich pokojach, admin widzi i moderuje
-- wszystkie; PUBLICZNA lista na landingu idzie przez widok poniżej (security
-- definer), więc nie potrzebuje osobnej polityki "select for anon" tutaj.
create policy "testimonials_owner_read" on testimonials
  for select using (
    exists (select 1 from rooms r where r.id = room_id and (r.owner_id = auth.uid() or is_admin()))
    or is_admin()
  );
create policy "testimonials_admin_moderate" on testimonials
  for update using (is_admin());

-- Widok publiczny: tylko zatwierdzone opinie z pisemną zgodą.
create or replace view public_testimonials as
  select id, rating, body, author_name, author_role, created_at
  from testimonials
  where status = 'approved' and consent_public = true
  order by created_at desc;

-- ============================================================
-- STORAGE — prywatny bucket na pliki dostaw
-- ============================================================
insert into storage.buckets (id, name, public)
values ('deliveries', 'deliveries', false)
on conflict (id) do nothing;

-- Tylko właściciel pokoju (po ścieżce "{owner_id}/{room_id}/...") może
-- wrzucać/czytać/kasować przez zalogowaną sesję. Dostęp klienta do
-- pojedynczych plików idzie przez signed URL generowane service_role'em
-- w route handlerze /api/upload-sign i /api/.../download, więc nie
-- potrzebuje dodatkowej polityki anon tutaj.
create policy "storage_owner_rw" on storage.objects
  for all using (
    bucket_id = 'deliveries' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'deliveries' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Skrypt: nadanie roli admina pierwszemu użytkownikowi
-- Uruchom RĘCZNIE po zarejestrowaniu konta w Supabase Auth,
-- podmieniając adres e-mail:
-- ============================================================
-- insert into profiles (id, role, display_name, must_change_password)
-- select id, 'admin', 'Admin', false from auth.users where email = 'twoj@email.com'
-- on conflict (id) do update set role = 'admin';

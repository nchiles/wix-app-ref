-- ============================================
-- Disney Attractions Planner — Initial Schema
-- ============================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Riders
create table public.riders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  age_range text not null check (age_range in ('infant', 'child', 'teen', 'adult')),
  height_inches integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.riders enable row level security;

create policy "Users can manage own riders"
  on public.riders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Attractions
create table public.attractions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  park text not null,
  sub_park text,
  ride_type text,
  min_age text,
  height_requirement integer, -- inches, null = no requirement
  rain_safe boolean default true,
  attraction_api_id text, -- for themeparks.wiki lookup
  image_url text,
  lightning_lane_type text check (lightning_lane_type in ('single_pass', 'genie_plus', null)),
  lightning_lane_price decimal,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.attractions enable row level security;

-- Attractions are readable by all authenticated users
create policy "Authenticated users can view attractions"
  on public.attractions for select
  using (auth.role() = 'authenticated');

-- Rider-Attraction preferences (junction table)
create table public.rider_attractions (
  id uuid default gen_random_uuid() primary key,
  rider_id uuid references public.riders(id) on delete cascade not null,
  attraction_id uuid references public.attractions(id) on delete cascade not null,
  can_ride boolean default true,
  rating integer check (rating between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (rider_id, attraction_id)
);

alter table public.rider_attractions enable row level security;

create policy "Users can manage preferences for own riders"
  on public.rider_attractions for all
  using (
    rider_id in (select id from public.riders where user_id = auth.uid())
  )
  with check (
    rider_id in (select id from public.riders where user_id = auth.uid())
  );

-- Auto-evaluate can_ride when rider_attraction is inserted
create or replace function public.evaluate_can_ride()
returns trigger as $$
declare
  rider_height integer;
  attraction_height integer;
begin
  select height_inches into rider_height from public.riders where id = new.rider_id;
  select height_requirement into attraction_height from public.attractions where id = new.attraction_id;

  if attraction_height is not null and rider_height < attraction_height then
    new.can_ride := false;
  else
    new.can_ride := true;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger evaluate_can_ride_on_insert
  before insert on public.rider_attractions
  for each row execute function public.evaluate_can_ride();

create trigger evaluate_can_ride_on_update
  before update on public.rider_attractions
  for each row execute function public.evaluate_can_ride();

-- Auto-create rider_attraction rows for all attractions when a new rider is added
create or replace function public.create_rider_attractions()
returns trigger as $$
begin
  insert into public.rider_attractions (rider_id, attraction_id)
  select new.id, a.id from public.attractions a;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_rider_created
  after insert on public.riders
  for each row execute function public.create_rider_attractions();

-- Updated_at triggers
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger update_riders_updated_at before update on public.riders
  for each row execute function public.update_updated_at();
create trigger update_attractions_updated_at before update on public.attractions
  for each row execute function public.update_updated_at();
create trigger update_rider_attractions_updated_at before update on public.rider_attractions
  for each row execute function public.update_updated_at();

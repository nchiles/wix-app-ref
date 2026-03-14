# Disney Attractions Planner — Modernization Plan

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password signup & login)
- **Styling**: Tailwind CSS
- **API**: themeparks.wiki (live wait times)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Database Schema (Supabase/PostgreSQL)

### `profiles` (extends Supabase auth.users)
- `id` (uuid, FK to auth.users)
- `display_name` (text)
- `created_at`, `updated_at`

### `riders`
- `id` (uuid, PK)
- `user_id` (uuid, FK to profiles — owner)
- `name` (text)
- `age_range` (enum: infant, child, teen, adult)
- `height_inches` (integer)
- `created_at`, `updated_at`

### `attractions`
- `id` (uuid, PK)
- `name` (text)
- `park` (text — MK, EPCOT, AK, HS)
- `sub_park` (text — land/area)
- `ride_type` (text)
- `min_age` (text)
- `height_requirement` (integer, nullable — inches)
- `rain_safe` (boolean)
- `attraction_api_id` (text — for themeparks.wiki lookup)
- `image_url` (text)
- `lightning_lane_type` (text — single_pass, genie_plus, null)
- `lightning_lane_price` (decimal, nullable)
- `tags` (text[] — array of tags like "Thrill Ride", "Dark", etc.)
- `created_at`, `updated_at`

### `rider_attractions` (preferences junction table)
- `id` (uuid, PK)
- `rider_id` (uuid, FK to riders)
- `attraction_id` (uuid, FK to attractions)
- `can_ride` (boolean — auto-calculated from height)
- `rating` (integer, 1-5, nullable)
- `created_at`, `updated_at`
- unique constraint on (rider_id, attraction_id)

## Pages (App Router)

1. **`/` — Landing/Login page**
2. **`/signup` — Registration**
3. **`/home` — Attractions list** (main page, matches screenshot 1)
   - Left sidebar: search, park filter, rain filter, rider filter
   - Card grid: attraction image, tags, height req, wait time, rider icons, rating
4. **`/preferences` — Set ride preferences** (matches screenshot 2)
   - Per-attraction: toggle can_ride, set 1-5 heart rating per rider
5. **`/riders` — Manage riders** (matches screenshot 3)
   - List current riders
   - "Add a rider" modal: name, age range, height slider

## Implementation Phases

### Phase 1: Project Scaffolding
- [x] Initialize Next.js project with App Router
- [x] Install dependencies (Supabase client, Tailwind)
- [x] Set up project structure (components, lib, app routes)
- [x] Configure Supabase client utility
- [x] Create environment variable template

### Phase 2: Database & Auth
- [ ] Create Supabase migration files for all tables + RLS policies
- [ ] Build auth pages (login, signup)
- [ ] Add auth middleware for protected routes
- [ ] Create `profiles` trigger (auto-create on signup)

### Phase 3: Riders Management
- [ ] Riders list page
- [ ] Add rider modal (name, age range, height slider)
- [ ] Auto-generate rider_attraction rows on rider creation
- [ ] Edit/delete rider

### Phase 4: Attractions & Wait Times
- [ ] Seed attractions data (from CSV or admin interface)
- [ ] Attraction card component
- [ ] Wait times API integration (themeparks.wiki)
- [ ] Filtering (park, rain, search, rider eligibility)

### Phase 5: Preferences
- [ ] Preferences page with attraction list
- [ ] Per-rider can_ride toggle + rating input
- [ ] Auto-evaluate can_ride based on height

### Phase 6: Polish
- [ ] Responsive design
- [ ] Loading states & error handling
- [ ] Deploy to Vercel

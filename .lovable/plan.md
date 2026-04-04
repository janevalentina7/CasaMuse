## Plan: Authentication & Cloud Project Storage

### 1. Database Migration
- Create `profiles` table (user_id, display_name, avatar_url)
- Create `projects` table (id, user_id, project_name, form_data, floor_plan_url, rendered_images, model_3d_link, cost_estimation, current_stage, created_at, updated_at)
- RLS policies for both tables
- Auto-create profile trigger on signup

### 2. Auth Configuration
- Enable email/password auth (no auto-confirm per best practice)

### 3. Auth Pages
- Create `/auth` page with login/signup/forgot-password tabs
- Create `/reset-password` page

### 4. Auth Context
- Create `AuthProvider` with session management
- Protected route wrapper component

### 5. Update App Router
- Add auth routes, protect dashboard/design routes
- Auto-redirect logic (logged in → dashboard, logged out → login)

### 6. Cloud Project Storage
- Replace localStorage-based `projectStorage.ts` with Supabase queries
- Add auto-save hook (every 15 seconds)
- Update Dashboard to fetch from DB

### 7. UI Updates
- Show user name in header
- Add logout button
- "Last edited" timestamps on project cards

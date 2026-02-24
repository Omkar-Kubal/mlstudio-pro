# MLStudio Pro — Recent Changes

_Last updated: 2026-02-24_

---

## 1. Authentication Expansion

- **Google OAuth** added alongside existing GitHub login.
- **Email/Password** login implemented with a toggle between Magic Link (passwordless) and traditional password modes.
- **Sign-Up** flow added (email + password with email confirmation).
- Dynamic UI switching between login modes (Magic Link / Password / Sign Up).
- Improved error handling for Supabase auth events (rate limits, invalid credentials, already-registered).
- Apple Login removed (requires paid Apple Developer account).

---

## 2. User Progress Dashboard (`/dashboard`)

- New page at `/dashboard` with premium "Neural Interface" aesthetic.
- **Mastery Level** dynamically calculated from completed topics (Initiate → Grandmaster).
- Stat cards for: Topics Mastered, Modules Unlocked, and Overall Progress.
- Personalized greeting using `display_name` from user profile.
- Persona-aware motivational quote (Beginner vs. Advanced).
- "Resume Curriculum" quick-action card.
- Protected by `ProtectedRoute` — unauthenticated users are redirected.

---

## 3. Profile Customization (`/profile`)

- New page at `/profile` for user settings.
- Users can update: **Display Name**, **Bio**, **Avatar URL**, and **Learning Persona** (Beginner / Advanced).
- **Backend**: New `ProfileManager` service and `/profile` router (GET + PATCH) integrated with Supabase `profiles` table.
- Profile data loaded and displayed on the Dashboard.

---

## 4. ESLint & Linting Infrastructure

- Upgraded `eslint-config-next` from a stale `0.2.4` version to `15.1.0`.
- Downgraded `eslint` from v10 to v9 for peer-dependency compatibility.
- Rewrote `eslint.config.mjs` using the modern **ESLint Flat Config** with `FlatCompat` to properly load Next.js rules.
- Fixed all `npm run lint` errors:
  - Unescaped entities in `DashboardPage.tsx`
  - `any` type in `LoginPage.tsx`
  - Unused variables in `Visualizer.tsx` and `SectionTextOverlay.tsx`
  - Unused `sectionMid` prop in `SectionTextOverlay.tsx`

---

## 5. Import Path Standardization

- All broken `@/lib/` imports corrected to `@/adapters/` across:
  - `TopicRenderer.tsx`
  - `ModuleContent.tsx`
  - `FitProgressionPrimitive.tsx`
  - `SystemScrollCanvas.tsx` (`@/data/sections` → `@/adapters/sections`)
  - `app/api/content/route.ts`

---

## 6. Backend Audit & Cleanup

- Removed duplicate/broken `update_topic_completion` method from `progress_manager.py`.
- Verified `curriculum_loader.py` uses `pathlib` for portable cross-platform paths.
- Added `profile.py` router to `main.py`.

---

## 7. File Cleanup

- Removed temporary lint report files (`lint_report.txt`, `lint_output.txt`, etc.).
- Removed stray `__init__.py` files from frontend directories (`/`, `/adapters/`, `/visuals/`).
- Removed redundant `.md` source documents from `backend/core/content/curriculum/foundations/` (JSON versions are the authoritative source).

---

## 8. Code Quality Fixes

- Linting errors resolved in `LoginPage.tsx` (`any` type, unused catch variable).
- `SectionTextProps` interface updated to remove unreferenced `sectionMid`.
- `Visualizer.tsx` updated to omit unused `subject` prop from destructuring.

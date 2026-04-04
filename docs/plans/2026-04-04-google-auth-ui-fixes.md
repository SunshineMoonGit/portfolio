# Google Auth And UI Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace admin-password login with Google-only auth plus admin email allowlist, and fix the approved footer/code block UX issues.

**Architecture:** Keep the existing FastAPI OAuth flow and Svelte auth store, but move role assignment to the server using a configurable admin email allowlist. On the frontend, simplify the login modal to Google-only, widen the footer separator to the viewport, and enhance rendered markdown code blocks with wrapping and copy controls.

**Tech Stack:** FastAPI, SQLAlchemy, SvelteKit, Svelte 5, marked, Docker Compose

---

### Task 1: Persist email and derive roles from allowlist

**Files:**
- Modify: `apps/api/db/models.py`
- Modify: `apps/api/db/init_db.py`
- Modify: `apps/api/services/auth.py`

**Step 1: Write the failing test**

Document the desired behavior in a focused regression check:
- Google user email in `ADMIN_EMAILS` becomes `admin`
- Other Google users become `user`
- API response includes `email`

**Step 2: Run test to verify it fails**

Run the narrowest available backend verification after adding the test or reproduction command.

**Step 3: Write minimal implementation**

- Add `email` column to `User`
- Parse `ADMIN_EMAILS`
- During Google OAuth, store/update email and assign `role`
- Return `email` from `/auth/me`

**Step 4: Run test to verify it passes**

Re-run the same backend verification.

**Step 5: Commit**

Commit after backend auth behavior is stable.

### Task 2: Remove password login UI and keep Google-only login

**Files:**
- Modify: `apps/web/src/lib/auth.ts`
- Modify: `apps/web/src/routes/+layout.svelte`

**Step 1: Write the failing test**

Document expected behavior:
- Login modal shows only Google login action
- No admin password form remains
- Auth user shape includes `email`

**Step 2: Run test to verify it fails**

Run the narrowest frontend verification after the assertions are added.

**Step 3: Write minimal implementation**

- Extend frontend `User` type with `email`
- Remove admin password submit flow
- Keep only Google OAuth entrypoint
- Preserve admin menu visibility based on server role

**Step 4: Run test to verify it passes**

Re-run the same frontend verification.

**Step 5: Commit**

Commit once Google-only UI is in place.

### Task 3: Fix footer border and code block UX

**Files:**
- Modify: `apps/web/src/routes/+layout.svelte`
- Modify: `apps/web/src/routes/notes/[slug]/+page.svelte`

**Step 1: Write the failing test**

Document expected behavior:
- Footer divider spans the viewport rather than only the centered content width
- Rendered code blocks wrap long lines or provide horizontal overflow safely
- Each fenced code block exposes a copy button

**Step 2: Run test to verify it fails**

Run the narrowest frontend verification.

**Step 3: Write minimal implementation**

- Restructure footer separator placement
- Post-process rendered markdown code blocks to inject copy controls
- Add client-side copy handler and visual feedback
- Update prose CSS for long code handling

**Step 4: Run test to verify it passes**

Re-run the same frontend verification.

**Step 5: Commit**

Commit after the note detail UX is stable.

### Task 4: Final verification

**Files:**
- Modify if needed: `.env.example` files and related docs for `ADMIN_EMAILS`

**Step 1: Run full verification**

Run:
- `pnpm --filter web check`
- `pnpm --filter web build`

If practical in current environment, also validate backend startup path used by Docker.

**Step 2: Review logs/output**

Confirm zero blocking errors. If failures appear, fix and re-run before claiming completion.


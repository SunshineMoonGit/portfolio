# SvelteKit Static Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the current SvelteKit + FastAPI portfolio into a SvelteKit-only static site deployable to GitHub Pages with search, related-content recommendations, and Giscus comments.

**Architecture:** Move all runtime content loading to build time. A local content-generation step will read `data/` and `vault/` sources, produce generated JSON/TS modules for the frontend, and SvelteKit will prerender static pages with `adapter-static`. Interactive features that require persistence will use external services instead of a self-hosted backend.

**Tech Stack:** SvelteKit, `@sveltejs/adapter-static`, TypeScript, Markdown parsing, GitHub Pages, GitHub Actions, Giscus

---

## File Ownership Summary

**Delete**
- `apps/api/**`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/routes/+page.server.ts`
- `apps/web/src/routes/notes/+page.server.ts`
- `apps/web/src/routes/notes/[slug]/+page.server.ts`
- `apps/web/src/routes/projects/+page.server.ts`
- `apps/web/src/routes/projects/[slug]/+page.server.ts`
- `apps/web/src/routes/admin/+page.svelte`
- `apps/web/src/routes/admin/notes/[slug]/+page.svelte`
- `apps/web/src/routes/auth/callback/+page.svelte`
- `apps/web/src/lib/components/organisms/CommentSection.svelte`
- `apps/web/src/lib/components/organisms/LikeBar.svelte`
- `apps/web/src/lib/components/organisms/LoginModal.svelte`

**Keep and refactor**
- `apps/web/svelte.config.js`
- `apps/web/vite.config.ts`
- `apps/web/src/routes/+page.svelte`
- `apps/web/src/routes/notes/+page.svelte`
- `apps/web/src/routes/notes/[slug]/+page.svelte`
- `apps/web/src/routes/projects/+page.svelte`
- `apps/web/src/routes/projects/[slug]/+page.svelte`
- `apps/web/src/lib/project-content.ts`
- `apps/web/src/lib/components/organisms/AppHeader.svelte`
- `apps/web/src/lib/components/organisms/RecentNotes.svelte`
- `apps/web/src/lib/components/organisms/ProjectGrid.svelte`
- `apps/web/src/lib/components/organisms/MarkdownProse.svelte`
- `apps/web/src/lib/components/organisms/NotePager.svelte`
- `apps/web/src/lib/components/organisms/TableOfContents.svelte`
- `packages/content-types/src/index.ts`

**Create**
- `apps/web/src/lib/content.ts`
- `apps/web/src/lib/search.ts`
- `apps/web/src/lib/relations.ts`
- `apps/web/src/lib/components/organisms/GiscusComments.svelte`
- `apps/web/src/lib/generated/notes.json`
- `apps/web/src/lib/generated/projects.json`
- `apps/web/src/lib/generated/profile.json`
- `apps/web/src/lib/generated/search-index.json`
- `apps/web/src/lib/generated/relations.json`
- `scripts/build-content.ts`
- `apps/web/src/routes/tags/[tag]/+page.svelte`
- `apps/web/src/routes/search/+page.svelte`
- `.github/workflows/deploy-pages.yml`

## Target Behavior

- The site builds with no running backend.
- Every public page is prerendered to static files.
- Notes and projects are rendered from generated local data.
- Search works in the browser from a prebuilt index.
- Related notes and backlinks are computed during the content build.
- Comments work through Giscus and GitHub Discussions.
- Deployment works through GitHub Pages and a custom domain.

### Task 1: Freeze Current Data Model

**Files:**
- Modify: `packages/content-types/src/index.ts`
- Reference: `data/index.json`
- Reference: `data/profile.json`

**Step 1: Expand the shared content types**

Add types for:
- `SearchDocument`
- `RelatedLink`
- `Backlink`
- `TagPage`
- `ProjectDetail`

Keep note/project/profile types free of runtime server assumptions.

**Step 2: Run typecheck**

Run: `pnpm --filter web check`
Expected: existing app still typechecks before the static migration starts.

**Step 3: Commit**

```bash
git add packages/content-types/src/index.ts
git commit -m "refactor: define static content types"
```

### Task 2: Add Build-Time Content Generator

**Files:**
- Create: `scripts/build-content.ts`
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Reference: `data/index.json`
- Reference: `data/profile.json`
- Reference: `vault/project/**`

**Step 1: Write the content generator**

Responsibilities:
- read `data/index.json` and note detail sources
- read `data/profile.json`
- read project markdown from `vault/project`
- normalize slugs, tags, categories, summaries
- generate:
  - `apps/web/src/lib/generated/notes.json`
  - `apps/web/src/lib/generated/projects.json`
  - `apps/web/src/lib/generated/profile.json`
  - `apps/web/src/lib/generated/search-index.json`
  - `apps/web/src/lib/generated/relations.json`

**Step 2: Add build scripts**

Root script:
- `build:content`

Web build flow:
- run content generation before `vite build`

**Step 3: Run generator**

Run: `pnpm build:content`
Expected: all generated files are written and readable JSON.

**Step 4: Commit**

```bash
git add package.json apps/web/package.json scripts/build-content.ts apps/web/src/lib/generated
git commit -m "feat: generate static content artifacts"
```

### Task 3: Remove Runtime API Dependencies

**Files:**
- Delete: `apps/web/src/lib/api.ts`
- Delete: `apps/web/src/lib/api-client.ts`
- Delete: `apps/web/src/lib/auth.ts`
- Modify: `apps/web/src/lib/index.ts`
- Modify: `apps/web/src/lib/project-content.ts`
- Create: `apps/web/src/lib/content.ts`
- Create: `apps/web/src/lib/relations.ts`
- Create: `apps/web/src/lib/search.ts`

**Step 1: Replace API helpers with static-content helpers**

`content.ts` should expose synchronous helpers such as:
- `getProfile()`
- `getProjects()`
- `getProjectBySlug(slug)`
- `getNotes()`
- `getNoteBySlug(slug)`

These should read from imported generated JSON, not fetch.

**Step 2: Move relationship logic into pure helpers**

`relations.ts` should expose:
- `getRelatedNotes(slug)`
- `getBacklinks(slug)`
- `getNotesByTag(tag)`

**Step 3: Move client search into pure helpers**

`search.ts` should expose a simple in-browser filter/ranking function over `search-index.json`.

**Step 4: Run typecheck**

Run: `pnpm --filter web check`
Expected: no remaining imports of deleted API/auth modules.

**Step 5: Commit**

```bash
git add apps/web/src/lib
git commit -m "refactor: replace runtime api dependencies with static content helpers"
```

### Task 4: Convert SvelteKit to Static Output

**Files:**
- Modify: `apps/web/svelte.config.js`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/src/app.html`
- Create: `apps/web/src/routes/+layout.ts`

**Step 1: Switch adapters**

Replace `@sveltejs/adapter-node` with `@sveltejs/adapter-static`.

**Step 2: Add prerender defaults**

Set layout-level defaults for:
- `prerender = true`
- `trailingSlash = 'always'` if needed for GitHub Pages consistency

**Step 3: Configure base path**

Add a single source of truth for repo-name base handling so GitHub Pages and custom domain deployment both work.

**Step 4: Run build**

Run: `pnpm --filter web build`
Expected: static output only, no adapter-node output.

**Step 5: Commit**

```bash
git add apps/web/svelte.config.js apps/web/vite.config.ts apps/web/src/app.html apps/web/src/routes/+layout.ts
git commit -m "build: switch sveltekit to static output"
```

### Task 5: Replace Server Load Functions

**Files:**
- Delete: `apps/web/src/routes/+page.server.ts`
- Delete: `apps/web/src/routes/notes/+page.server.ts`
- Delete: `apps/web/src/routes/notes/[slug]/+page.server.ts`
- Delete: `apps/web/src/routes/projects/+page.server.ts`
- Delete: `apps/web/src/routes/projects/[slug]/+page.server.ts`
- Modify: `apps/web/src/routes/+page.svelte`
- Modify: `apps/web/src/routes/notes/+page.svelte`
- Modify: `apps/web/src/routes/notes/[slug]/+page.svelte`
- Modify: `apps/web/src/routes/projects/+page.svelte`
- Modify: `apps/web/src/routes/projects/[slug]/+page.svelte`
- Create: `apps/web/src/routes/notes/[slug]/+page.ts`
- Create: `apps/web/src/routes/projects/[slug]/+page.ts`

**Step 1: Inline static data loading**

List pages should import from `content.ts` directly.

**Step 2: Add dynamic route entry generation**

For note/project detail routes, export `entries()` so SvelteKit prerenders every known slug.

**Step 3: Remove runtime-only behavior**

Delete any `fetch`, auth, or API code paths from route components.

**Step 4: Run build**

Run: `pnpm --filter web build`
Expected: note and project detail pages prerender successfully.

**Step 5: Commit**

```bash
git add apps/web/src/routes
git commit -m "refactor: prerender content routes from generated data"
```

### Task 6: Remove Admin and Self-Hosted Interaction Features

**Files:**
- Delete: `apps/web/src/routes/admin/+page.svelte`
- Delete: `apps/web/src/routes/admin/notes/[slug]/+page.svelte`
- Delete: `apps/web/src/routes/auth/callback/+page.svelte`
- Delete: `apps/web/src/lib/components/organisms/CommentSection.svelte`
- Delete: `apps/web/src/lib/components/organisms/LikeBar.svelte`
- Delete: `apps/web/src/lib/components/organisms/LoginModal.svelte`
- Modify: `apps/web/src/lib/components/index.ts`
- Modify: `apps/web/src/lib/components/organisms/AppHeader.svelte`

**Step 1: Remove dead navigation and imports**

Clean header/footer/nav references to admin, login, or likes.

**Step 2: Replace comments with placeholder mount point**

Detail pages should keep a content footer area reserved for Giscus.

**Step 3: Run typecheck**

Run: `pnpm --filter web check`
Expected: no references to auth/admin/comments/likes components remain.

**Step 4: Commit**

```bash
git add apps/web/src/lib/components apps/web/src/routes
git commit -m "refactor: remove backend-dependent interaction features"
```

### Task 7: Add Search, Recommendations, and Backlinks

**Files:**
- Create: `apps/web/src/routes/search/+page.svelte`
- Create: `apps/web/src/routes/tags/[tag]/+page.svelte`
- Create: `apps/web/src/routes/tags/[tag]/+page.ts`
- Modify: `apps/web/src/routes/notes/+page.svelte`
- Modify: `apps/web/src/routes/notes/[slug]/+page.svelte`
- Modify: `apps/web/src/lib/components/organisms/RecentNotes.svelte`
- Modify: `apps/web/src/lib/components/organisms/TableOfContents.svelte`

**Step 1: Add site search page**

Use a client-side query input against `search-index.json`.

**Step 2: Add related-content section**

On note detail pages show:
- related notes
- backlinks
- same-tag links

**Step 3: Add tag landing pages**

Each tag page should list all associated notes.

**Step 4: Run build and manual smoke test**

Run:
- `pnpm --filter web build`
- `pnpm --filter web preview`

Expected:
- search page renders
- note detail pages show related links
- tag routes resolve

**Step 5: Commit**

```bash
git add apps/web/src/routes apps/web/src/lib/components apps/web/src/lib/search.ts apps/web/src/lib/relations.ts
git commit -m "feat: add static search and related content views"
```

### Task 8: Add Giscus Comments

**Files:**
- Create: `apps/web/src/lib/components/organisms/GiscusComments.svelte`
- Modify: `apps/web/src/routes/notes/[slug]/+page.svelte`
- Modify: `apps/web/src/lib/components/index.ts`

**Step 1: Implement a Giscus wrapper**

Props should include:
- repository
- repositoryId
- category
- categoryId
- mapping strategy
- term

**Step 2: Mount only in browser**

Guard script injection so prerendered output remains clean.

**Step 3: Configure note detail pages**

Use slug- or pathname-based mapping per note page.

**Step 4: Manual verification**

Run: `pnpm --filter web preview`
Expected: Giscus container renders without build errors.

**Step 5: Commit**

```bash
git add apps/web/src/lib/components apps/web/src/routes/notes/[slug]/+page.svelte
git commit -m "feat: add giscus comments to note pages"
```

### Task 9: Add GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `apps/web/package.json`
- Modify: `README.md`
- Optional: `apps/web/static/CNAME`

**Step 1: Add GitHub Actions deploy workflow**

Workflow should:
- install pnpm
- install dependencies
- run `pnpm build:content`
- run `pnpm --filter web build`
- upload static output
- deploy to GitHub Pages

**Step 2: Document repository settings**

README should explain:
- Pages source is GitHub Actions
- custom domain setup
- required Giscus config values

**Step 3: Verify workflow locally as far as possible**

Run:
- `pnpm build:content`
- `pnpm --filter web build`

Expected: repository is ready for CI deploy.

**Step 4: Commit**

```bash
git add .github/workflows/deploy-pages.yml apps/web/package.json README.md apps/web/static/CNAME
git commit -m "ci: deploy static portfolio to github pages"
```

### Task 10: Remove Obsolete Backend Assets

**Files:**
- Delete: `apps/api/**`
- Modify: `package.json`
- Modify: `docker-compose.yml`
- Modify: `Makefile`
- Modify: `README.md`
- Review: `nginx.conf`
- Review: `.env`

**Step 1: Remove backend-only scripts and docs**

Delete or rewrite commands that assume:
- FastAPI
- Docker compose app runtime
- local API server
- OAuth callback flow

**Step 2: Clean deployment docs**

Make README reflect the new static-only architecture.

**Step 3: Final verification**

Run:
- `pnpm build:content`
- `pnpm --filter web check`
- `pnpm --filter web build`

Expected:
- all commands pass
- no runtime backend dependency remains

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete backend stack"
```

## Review Checklist

- No imports from `$env/dynamic/private`
- No `fetch('/api/...')` calls in frontend routes/components
- No `+page.server.ts` files remain for content pages
- No Node filesystem reads happen during request handling
- Static build succeeds from a clean checkout
- Search index is generated before frontend build
- Note detail pages still render TOC and markdown correctly
- Tag pages and related-note links use valid slugs
- Giscus config is documented, not hardcoded with secrets

## Verification Commands

```bash
pnpm build:content
pnpm --filter web check
pnpm --filter web build
pnpm --filter web preview
```

Plan complete and saved to `docs/plans/2026-04-04-sveltekit-static-portfolio-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

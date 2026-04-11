# Note UX/UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 검색 유입 중심의 개인 기술 블로그 톤에 맞게 `notes` 리스트와 `note` 상세를 강하게 재디자인한다.

**Architecture:** 왼쪽 카테고리 바, 가운데 본문/포스트 목록, 오른쪽 보조 탐색의 큰 구조는 유지하되 정보 위계를 다시 짠다. 리스트는 제목+요약 중심의 블로그 포스트 목록으로, 상세는 본문 중심 컬럼과 오른쪽 `On this page` 중심 레일로 재구성한다.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind CSS v4, existing content utilities

---

### Task 1: Reframe the category rail as editorial navigation

**Files:**
- Modify: `apps/web/src/lib/components/organisms/NotesCategoryRail.svelte`
- Modify: `apps/web/src/lib/components/organisms/CategoryTree.svelte`
- Test: `apps/web` type/build verification

**Step 1: Write the failing verification target**

Target behavior:
- rail reads like blog navigation, not tool sidebar
- compact header such as `Browse topics`
- softer visual weight than the main content

**Step 2: Run current verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS before restyling so later regressions are attributable to the redesign

**Step 3: Rebuild the rail header and spacing**

Update `NotesCategoryRail.svelte` so the top block reads like editorial navigation:
- new short title
- short supporting sentence
- cleaner count treatment
- lighter panel styling

**Step 4: Simplify category item visual hierarchy**

Update `CategoryTree.svelte` to reduce “tool UI” feel:
- lighter active/hover treatment
- less boxy row styling
- stronger typography hierarchy over chrome

**Step 5: Run verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/src/lib/components/organisms/NotesCategoryRail.svelte apps/web/src/lib/components/organisms/CategoryTree.svelte
git commit -m "feat: redesign notes category rail"
```

### Task 2: Redesign the notes list into a post archive

**Files:**
- Modify: `apps/web/src/lib/components/organisms/NotesListView.svelte`
- Modify: `apps/web/src/routes/notes/+page.svelte`
- Modify: `apps/web/src/routes/notes/[...path]/+page.svelte`
- Test: `apps/web` type/build verification

**Step 1: Write the failing verification target**

Target behavior:
- list reads like a blog archive
- no thumbnail dependency
- title and summary are the primary signals

**Step 2: Run current verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS before layout rewrite

**Step 3: Rebuild archive page intro**

Update the archive header to emphasize:
- page title
- short explanatory copy
- count as secondary metadata

**Step 4: Rebuild note list items**

Each row should prioritize:
- title
- short summary
- date
- category
- optional tags in low emphasis

Remove any layout reliance on thumbnails. If a compact category marker is needed, keep it textual.

**Step 5: Verify responsive behavior in markup**

Ensure the list remains:
- left rail + center list on desktop
- stacked rail then list on mobile

**Step 6: Run verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS

**Step 7: Commit**

```bash
git add apps/web/src/lib/components/organisms/NotesListView.svelte apps/web/src/routes/notes/+page.svelte apps/web/src/routes/notes/[...path]/+page.svelte
git commit -m "feat: redesign notes archive as blog list"
```

### Task 3: Rebuild note detail around reading flow

**Files:**
- Modify: `apps/web/src/routes/note/[slug]/+page.svelte`
- Modify: `apps/web/src/routes/+layout.svelte`
- Modify: `apps/web/src/lib/components/organisms/MarkdownProse.svelte` only if article width/spacing needs adjustment
- Modify: `apps/web/src/lib/components/organisms/NotePager.svelte` only if placement or spacing needs adjustment
- Test: `apps/web` type/build verification

**Step 1: Write the failing verification target**

Target behavior:
- the page feels like a technical blog post first
- the article header is simplified
- right rail supports reading instead of competing with it

**Step 2: Run current verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS before detail rewrite

**Step 3: Simplify the article header**

Update the top section to show:
- breadcrumb
- title
- date/category meta
- tags

Avoid heavy card styling around the title block unless needed for rhythm.

**Step 4: Rework the center reading column**

Tune width and spacing so:
- prose width is clearly optimized for reading
- code blocks still fit comfortably
- title, intro area, and body feel vertically balanced

If needed, widen `/note/...` container in `apps/web/src/routes/+layout.svelte`.

**Step 5: Keep right rail focused**

Right rail order must be:
1. `On this page`
2. `Related`
3. `Backlinks`

`On this page` should be visually strongest. `Related` and `Backlinks` should be visibly secondary.

**Step 6: Restore reading/navigation order below the article**

Ensure `NotePager` appears before comments if that better preserves the reading flow.

**Step 7: Run verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS

**Step 8: Commit**

```bash
git add apps/web/src/routes/note/[slug]/+page.svelte apps/web/src/routes/+layout.svelte apps/web/src/lib/components/organisms/MarkdownProse.svelte apps/web/src/lib/components/organisms/NotePager.svelte
git commit -m "feat: redesign note detail as technical blog post"
```

### Task 4: Rework mobile reading flow explicitly

**Files:**
- Modify: `apps/web/src/routes/note/[slug]/+page.svelte`
- Modify: `apps/web/src/lib/components/organisms/TableOfContents.svelte` only if mobile placement or wrapper API needs adjustment
- Test: `apps/web` type/build verification

**Step 1: Write the failing verification target**

Target behavior:
- category navigation appears before or near the article on mobile
- `On this page` appears immediately after the article body
- comments do not push primary navigation below the fold

**Step 2: Check current mobile order in markup**

Review DOM order and class-based ordering in `note/[slug]/+page.svelte`.
Expected: identify any places where mobile relies on grid collapse rather than explicit flow.

**Step 3: Make mobile order explicit**

Adjust the template so mobile order is:
1. category navigation
2. article header + body
3. `On this page`
4. `Related` / `Backlinks`
5. `NotePager`
6. comments

Desktop layout can keep the right rail sticky.

**Step 4: Run verification**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/routes/note/[slug]/+page.svelte apps/web/src/lib/components/organisms/TableOfContents.svelte
git commit -m "fix: refine mobile note reading flow"
```

### Task 5: Final verification and visual QA

**Files:**
- Verify: `apps/web/src/lib/components/organisms/NotesCategoryRail.svelte`
- Verify: `apps/web/src/lib/components/organisms/NotesListView.svelte`
- Verify: `apps/web/src/lib/components/organisms/TableOfContents.svelte`
- Verify: `apps/web/src/routes/note/[slug]/+page.svelte`
- Verify: `apps/web/src/routes/+layout.svelte`

**Step 1: Run full type check**

Run: `./node_modules/.bin/svelte-kit sync && ./node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
Expected: `0 errors and 0 warnings`

**Step 2: Run production build**

Run: `./node_modules/.bin/vite build`
Expected: static build succeeds and writes output without errors

**Step 3: Review key screens manually**

Check:
- notes list desktop
- notes list mobile
- note detail desktop
- note detail mobile
- right TOC visibility and active state
- note pager placement relative to comments

**Step 4: Commit final polish**

```bash
git add apps/web/src
git commit -m "chore: polish note blog redesign"
```

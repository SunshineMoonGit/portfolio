# Atomic Design Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce an atomic design system in `apps/web` through a safe incremental refactor, starting with tokens, shared shells, and core public pages.

**Architecture:** Build the design system from the bottom up: create reusable tokens and low-level UI primitives first, assemble them into shared header/footer/modal organisms, then migrate the home page and note detail page onto those building blocks. Keep behavior stable while removing duplicated styling and ad hoc structure.

**Tech Stack:** SvelteKit, Svelte 5, Tailwind v4 theme tokens, TypeScript

---

### Task 1: Establish the design-system file structure

**Files:**
- Create: `apps/web/src/lib/components/atoms/`
- Create: `apps/web/src/lib/components/molecules/`
- Create: `apps/web/src/lib/components/organisms/`
- Create: `apps/web/src/lib/components/templates/`
- Modify: `apps/web/src/lib/index.ts`

**Step 1: Write the failing test**

Define the expected import surface for the initial shared components.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter web check`

**Step 3: Write minimal implementation**

Create the folder structure and export entry points for the first component set.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter web check`

### Task 2: Replace ad hoc globals with design tokens

**Files:**
- Modify: `apps/web/src/app.css`

**Step 1: Write the failing test**

Capture token names and target usage patterns for surfaces, text, borders, and accent states.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter web build`

**Step 3: Write minimal implementation**

Refactor color, spacing, and emphasis tokens for the new dark system without changing page behavior.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter web build`

### Task 3: Extract shared layout organisms

**Files:**
- Create: `apps/web/src/lib/components/organisms/AppHeader.svelte`
- Create: `apps/web/src/lib/components/organisms/AppFooter.svelte`
- Create: `apps/web/src/lib/components/organisms/LoginModal.svelte`
- Modify: `apps/web/src/routes/+layout.svelte`

**Step 1: Write the failing test**

Define the expected layout behavior:
- shared shell still renders children
- user menu still respects role
- login flow remains Google-only

**Step 2: Run test to verify it fails**

Run: `pnpm --filter web check`

**Step 3: Write minimal implementation**

Move header/footer/modal into organisms and keep existing behavior stable.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter web check`

### Task 4: Extract home-page organisms

**Files:**
- Create: `apps/web/src/lib/components/organisms/HeroSection.svelte`
- Create: `apps/web/src/lib/components/organisms/ProjectGrid.svelte`
- Create: `apps/web/src/lib/components/organisms/RecentNotes.svelte`
- Modify: `apps/web/src/routes/+page.svelte`

**Step 1: Write the failing test**

Define the required page behavior and visible structure for the home page.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter web build`

**Step 3: Write minimal implementation**

Split the home page into reusable organisms while keeping the hero motion and content behavior.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter web build`

### Task 5: Extract note-detail building blocks

**Files:**
- Create: `apps/web/src/lib/components/molecules/NoteMeta.svelte`
- Create: `apps/web/src/lib/components/molecules/CodeBlockHeader.svelte`
- Create: `apps/web/src/lib/components/organisms/CommentSection.svelte`
- Modify: `apps/web/src/routes/notes/[slug]/+page.svelte`

**Step 1: Write the failing test**

Define stable requirements:
- note detail still renders content
- copy button and language label still work
- likes/comments remain functional

**Step 2: Run test to verify it fails**

Run: `pnpm --filter web check`

**Step 3: Write minimal implementation**

Move metadata, codeblock header UI, and comments into reusable components.

**Step 4: Run test to verify it passes**

Run: `pnpm --filter web check`

### Task 6: Verification and next-slice handoff

**Files:**
- Modify if needed: component exports and docs

**Step 1: Run full verification**

Run:
- `pnpm --filter web check`
- `pnpm --filter web build`

**Step 2: Inspect remaining warnings**

Document any residual warnings, especially the existing admin form accessibility warnings, before moving to the next migration slice.

# Project Detail Page (Case Study) — Design

**Date:** 2026-10-11
**Status:** Approved in conversation, pending written-spec review

## Goal

Replace the project popup (`ProjectModal`) with a dedicated, shareable case-study page per project, so potential clients (Upwork, direct leads) can read the full story of a project and end on "Book a Call". Page content is authored in the existing CMS (`/admin`) using a Notion/Dribbble-style block builder. Micro-animations are added afterwards using the transitions.dev skill.

Content structure is based on Mobbin research of case-study pages (Vanta, COLLINS, ClickUp, Stripe, Sequence, Intercom, Udemy, Büro): hero with metadata grid → cover → story sections → metrics → gallery → client quote → previous/next project + CTA.

## Decisions (from the brainstorm)

| Topic | Decision |
|---|---|
| Content source | Authored in CMS `/admin`, stored in Neon |
| Content model | Block builder (ordered list of typed blocks), stored as JSONB |
| Sections | "Pick the best" → hero + cover + 6 block types + prev/next + CTA |
| URL | Path-based `/work/<slug>` |
| Animations | transitions.dev free skill, applied after the page works |
| Out of scope | Moving DB access server-side / rotating the exposed Neon credential (separate task) |

## 1. Routing & navigation

- New route: `/work/<slug>`. Parsed in `App.jsx` alongside the existing `/admin` path check and hash tabs.
  - `activeTab` gains the value `'project'`; a `projectSlug` state holds the slug.
  - Opening a project: `history.pushState(null, '', '/work/<slug>')`, set state, scroll to top.
  - Leaving (back link, sidebar nav, logo): `pushState` back to `/` + hash tab as today.
  - `popstate` re-parses the path so browser back/forward work.
- `WorkGrid` card click navigates to the detail page instead of opening `ProjectModal`. `ProjectModal.jsx` is deleted, along with the `selectedProject` state and the `pointer-events-none` / `aria-hidden` wrapper logic tied to it.
- Vercel already rewrites `/(.*)` → `/index.html`, so no server change is needed.
- **Asset paths:** all `./assets/...` references (23 in `src/` and `index.html`) become root-absolute `/assets/...`, and `vite.config.js` `base` changes from `'./'` to `'/'`, otherwise assets 404 on `/work/...`. Consequence: the legacy `npm run deploy` (GitHub Pages under `/personal-portfolio/`) will no longer work for deep links. Vercel is the primary host.
- `document.title` is set to `<Project title> — Donny Ridwan S` on the detail page and restored on leave.

## 2. Page layout (`ProjectDetail.jsx`)

Rendered inside the existing `<main>`; the desktop sidebar stays. The mobile/tablet `ProfileIntro` and floating chat button behave as on other pages, except `ProfileIntro` is hidden on the detail page so the case study starts immediately.

Content column: centered, `max-w-[880px]`, matching site style (monochrome, serif headings via `font-serif`, `rounded-none`, `#737373` secondary text, `#eeeeee` dividers).

Top to bottom:

1. **Back link** — "← All work", returns to `/#work`.
2. **Hero** (fixed fields)
   - Eyebrow: `category · year` (11px uppercase, tracking like existing section labels).
   - Title: serif, 36px mobile / 52px desktop.
   - Summary: one line, light 15px.
   - Metadata grid (2 cols mobile, 4 cols desktop): Client · Role · Year · Tools (tools comma-joined). Empty fields are omitted.
   - "Visit live site ↗" button (outline style) when `liveUrl` is set.
3. **Cover** — existing `image` / `video` (video: autoplay, muted, loop, playsInline), full content width, `aspect-[16/10]`, `object-cover`, background `accentColor`.
4. **Blocks** — rendered in stored order by `BlockRenderer`, vertical spacing 64px desktop / 40px mobile.
5. **Fallback** — if `blocks` is empty, render the legacy `description` as a single Text block labelled "Overview".
6. **Closing**
   - Previous / Next project: two cards side by side (stacked on mobile) with thumbnail, "Previous"/"Next" label and title. Order follows the published project list; wraps around at the ends. Hidden if only one published project.
   - CTA band: "Have a similar project in mind?" + existing "Book a Call" button (`changeTab('contact')`).

### Block types

All blocks share `{ id: string, type: string }`. A block whose required content is empty is not rendered.

| type | Fields | Required to render | Rendering |
|---|---|---|---|
| `text` | `label`, `heading`, `body` | `heading` or `body` | Label small uppercase grey; heading serif 28–32px; body light 15px, `whitespace-pre-line` |
| `image` | `url`, `caption` | `url` | Full width image, caption 12px grey below |
| `gallery` | `columns` (2\|3), `images: [{ url, caption }]` | ≥1 image with url | Grid 1 col mobile, `columns` cols ≥ md; `aspect-[4/3]` cover |
| `video` | `url`, `caption` | `url` | Same as cover video, caption below |
| `metrics` | `items: [{ value, label }]` (2–4) | ≥1 item with value | Grid 2 cols mobile, `items.length` cols ≥ md; value serif 48–64px, label 13px grey (same look as About "The Proof") |
| `quote` | `text`, `name`, `role` | `text` | Serif 24–28px quote, name + role below; left border `#e5e5e7` |

## 3. CMS block editor

Changes to `src/components/cms/ProjectEditor.jsx`, split into focused files:

- `src/components/cms/CaseStudyFields.jsx` — slug, client, summary, live URL.
- `src/components/cms/BlockEditor.jsx` — the list, add menu, reorder.
- `src/components/cms/blocks/*.jsx` — one small editor per block type (`TextBlockEditor`, `ImageBlockEditor`, `GalleryBlockEditor`, `VideoBlockEditor`, `MetricsBlockEditor`, `QuoteBlockEditor`).
- `src/lib/blocks.js` — block type registry (type, label, icon, `createEmpty()`, `isRenderable(block)`), shared by editor and renderer.

Form additions (below existing fields):

**Case Study Info**
- **Slug** — auto-derived from title (`kebab-case`, ASCII) until manually edited; validated: non-empty, `^[a-z0-9-]+$`, unique among projects (checked against loaded list). Error shown inline; save blocked while invalid.
- **Client**, **Summary** (one line), **Live site URL** (must start with `http` if set).

**Content Blocks**
- "+ Add block" → menu of the 6 types with lucide icons (`Type`, `Image`, `LayoutGrid`, `Video`, `BarChart3`, `Quote`). New block appended to the end with `id = crypto.randomUUID()`.
- Each block is a card: drag handle (⋮⋮), type label, ↑ / ↓ buttons, Duplicate, Delete (`confirm()`), then the type's fields.
- Reorder: framer-motion `Reorder.Group` / `Reorder.Item` with `dragListener={false}` + `useDragControls` bound to the handle, so text fields stay selectable. ↑/↓ buttons as touch/keyboard fallback.
- Image / video inputs reuse `MediaUploader` (`value`, `onChange`).
- After a successful save, show "View page ↗" linking to `/work/<slug>` (new tab).

## 4. Data model & persistence

### Neon schema migration (run once, with explicit user confirmation)

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study JSONB NOT NULL DEFAULT '{}'::jsonb;
-- backfill slugs from name, then:
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug);
```

Backfill derives a slug from `name` using the same `slugify` as the editor, de-duplicating with `-2`, `-3` suffixes.

### Shape

```js
project.slug        // 'harvasta'
project.caseStudy = {
  client: '',
  summary: '',
  liveUrl: '',
  blocks: [ { id, type, ...fields } ],
}
```

### Code paths to update (both must stay in sync)

- `api/portfolio.js` — GET select + map (`slug`, `caseStudy`), POST `project` insert/upsert.
- `src/lib/neon.js` — `fetchPortfolioFromNeon` fallback select + map, `saveToNeon('project')` fallback insert/upsert.
- `src/data/portfolioData.js` — add `slug` to every project and a full `caseStudy` with sample blocks to one project as the offline demo.
- A shared `slugify` lives in `src/lib/slug.js`; `api/portfolio.js` imports it too (plain ESM, no browser APIs).
- Missing `slug` at read time (old rows before backfill): derive from title so links never break.

## 5. Edge cases

- Unknown slug, or project with `published === false` → "Project not found" view with link back to Work (same layout shell).
- Data still loading from Neon on first paint: detail page renders from `portfolioData` fallback first, then re-renders when live data arrives (same as the grid today). If the slug only exists in live data, show nothing (blank content area) until the fetch resolves, then not-found if still missing.
- Slug changed in CMS → old URL becomes not-found (no redirects; YAGNI).

## 6. Micro-animations (after the page works)

1. Ask user before running `npx skills add Jakubantalik/transitions.dev` (downloads from npm).
2. Run `transitions review` to get findings.
3. Apply recipes to: grid → detail page enter, blocks fade/slide in on scroll with stagger (framer-motion `whileInView`), metrics **Number pop-in**, card and prev/next hover, CTA button.
4. Every animation honours `prefers-reduced-motion` (framer-motion `useReducedMotion` / CSS media query).

## 7. Verification

No test framework exists; verification is build + browser:

- `vite build` passes, no console errors.
- Each `/work/<slug>` loads directly (hard refresh) and from a grid click; back/forward work; not-found shows for a bad slug.
- Layout checked at 375px, 768px, 1024px, 1280px; no horizontal scroll.
- Every block type renders, and empty blocks are skipped.
- CMS: add, edit, reorder (drag + ↑/↓), duplicate, delete blocks; slug validation. Saving writes to the **production** Neon DB — tested with a temporary unpublished project, deleted afterwards, only with user permission.

## Out of scope

- Moving Neon access fully server-side and removing the hardcoded `neondb_owner` connection string from `src/lib/neon.js` (it ships in the public bundle). Tracked as a separate task; the user must rotate the Neon password.
- Slug redirects, SEO meta/OG tags per project, server-side rendering.

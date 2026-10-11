# Project Detail Page (Case Study) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the project popup with a shareable `/work/<slug>` case-study page whose content is authored as ordered blocks in the CMS.

**Architecture:** Pure logic (slugs, routing, block registry, project lookup) lives in small tested modules under `src/lib/`. `App.jsx` gains a path-based `project` view rendered by `ProjectDetail` + `BlockRenderer`. Content is stored in two new Neon columns (`slug`, `case_study` JSONB) and edited by a block builder in `ProjectEditor`.

**Tech Stack:** Vite 8, React 19, Tailwind 3, framer-motion 13 (`Reorder`, `whileInView`), lucide-react 1.x, Neon serverless, Vercel functions. Adds `vitest` (dev) for pure-module tests.

**Spec:** `docs/superpowers/specs/2026-10-11-project-detail-page-design.md`

## Global Constraints

- URL format: `/work/<slug>`; slug matches `^[a-z0-9-]+$`.
- Visual style: monochrome, `font-serif` headings, `rounded-none`, secondary text `#737373`, dividers `#eeeeee`, card bg `#f5f5f7` border `#e5e5e7` (same tokens as `AboutView.jsx`).
- Detail content column `max-w-[880px]`, centered.
- Block types exactly: `text`, `image`, `gallery`, `video`, `metrics`, `quote`.
- `case_study` JSON shape: `{ client, summary, liveUrl, blocks: [{ id, type, ...fields }] }`.
- Every read path (`api/portfolio.js`, `src/lib/neon.js`) and write path must include `slug` and `case_study` — the two files duplicate logic and must stay in sync.
- No new runtime dependencies. Icons from lucide-react (verified present: `Type`, `Image`, `LayoutGrid`, `Video`, `BarChart3`, `Quote`, `GripVertical`, `ArrowUp`, `ArrowDown`, `Copy`, `Trash2`, `Plus`, `ArrowLeft`, `ArrowRight`, `ArrowUpRight`).
- All animation must honour `prefers-reduced-motion`.
- Production DB writes (migration, CMS save tests) only after explicit user confirmation in chat.

## Review Focus

1. Titles that slugify to empty (emoji/non-Latin, e.g. `"🚀"`) or collide (`"Harvasta"` twice) → still get a valid, unique slug. Pinned in Task 1 (`slugify`/`uniqueSlug` tests).
2. Old DB rows where `case_study` is `null`, `{}`, a JSON string, or has no `blocks` → page renders hero + description fallback, no crash. Pinned in Task 2 (`normalizeCaseStudy` tests).
3. A block with an unknown `type` or malformed fields (e.g. gallery `columns: 7`, metrics `items: null`) → skipped or clamped, never throws. Pinned in Task 2 (`isRenderable`/`normalizeBlock` tests).
4. Direct visit / hard refresh on `/work/<slug>` (and unpublished slug) → page loads with assets, unpublished shows not-found. Pinned in Task 2 (`findPublishedProject`) and Task 6 browser check.
5. Single published project / slug at list ends → prev/next wraps or hides, no `undefined` cards. Pinned in Task 2 (`getAdjacentProjects` tests).

---

### Task 1: Test tooling, slug and route helpers

**Files:**
- Modify: `package.json` (add devDependency `vitest`, script `"test": "vitest run"`)
- Create: `src/lib/slug.js`, `src/lib/route.js`
- Test: `src/lib/slug.test.js`, `src/lib/route.test.js`

**Interfaces:**
- Produces: `slugify(text: string): string`; `uniqueSlug(base: string, taken: string[]): string`; `parseRoute(pathname: string, hash: string, search: string): { view: 'cms' | 'project' | 'work' | 'about' | 'contact' | 'chat', slug?: string }`; `projectPath(slug: string): string`.

- [ ] **Step 1: Install vitest** — `npm i -D vitest`, add `"test": "vitest run"` to scripts.
- [ ] **Step 2: Write failing tests**

```js
// slug.test.js
expect(slugify('HARVASTA')).toBe('harvasta');
expect(slugify('EvalNow: Educational UX for a multi-stakeholder platform')).toBe('evalnow-educational-ux-for-a-multi-stakeholder-platform');
expect(slugify('  Café — Résumé  ')).toBe('cafe-resume');
expect(slugify('🚀')).toBe('');
expect(uniqueSlug('harvasta', ['harvasta'])).toBe('harvasta-2');
expect(uniqueSlug('harvasta', ['harvasta', 'harvasta-2'])).toBe('harvasta-3');
expect(uniqueSlug('', [])).toBe('project');
expect(uniqueSlug('', ['project'])).toBe('project-2');

// route.test.js
expect(parseRoute('/work/harvasta', '', '')).toEqual({ view: 'project', slug: 'harvasta' });
expect(parseRoute('/work/harvasta/', '', '')).toEqual({ view: 'project', slug: 'harvasta' });
expect(parseRoute('/admin', '', '')).toEqual({ view: 'cms' });
expect(parseRoute('/', '#about', '')).toEqual({ view: 'about' });
expect(parseRoute('/', '', '?tab=contact')).toEqual({ view: 'contact' });
expect(parseRoute('/', '#cms', '')).toEqual({ view: 'cms' });
expect(parseRoute('/', '', '')).toEqual({ view: 'work' });
expect(projectPath('harvasta')).toBe('/work/harvasta');
```

- [ ] **Step 3: Run** `npm test` → FAIL (modules missing).
- [ ] **Step 4: Implement** — `slugify`: NFKD normalize, strip combining marks, lowercase, non `[a-z0-9]` runs → `-`, trim `-`. `parseRoute` must reproduce every rule of today's `getInitialTab` in `App.jsx` (path `/admin`|`/cms`, hash, `?tab=`, search containing admin/cms) plus the `/work/<slug>` rule checked first after cms.
- [ ] **Step 5: Run** `npm test` → PASS.
- [ ] **Step 6: Commit** `feat: add slug and route helpers with vitest`.

### Task 2: Block registry, case-study normalisation, project lookup

**Files:**
- Create: `src/lib/blocks.js`, `src/lib/projects.js`
- Test: `src/lib/blocks.test.js`, `src/lib/projects.test.js`

**Interfaces:**
- Consumes: `slugify` (Task 1).
- Produces:
  - `BLOCK_TYPES: Array<{ type, label, icon }>` in order text, image, gallery, video, metrics, quote (labels `Text`, `Image`, `Gallery`, `Video`, `Metrics`, `Quote`; icons per Global Constraints, `BarChart3` for metrics).
  - `createBlock(type: string): Block` — fresh `id` via `crypto.randomUUID()`; empty fields: text `{label:'',heading:'',body:''}`, image/video `{url:'',caption:''}`, gallery `{columns:2,images:[]}`, metrics `{items:[{value:'',label:''},{value:'',label:''}]}`, quote `{text:'',name:'',role:''}`.
  - `normalizeBlock(raw: any): Block | null` — null for unknown type/non-object; clamps gallery `columns` to 2|3 (default 2); coerces missing arrays to `[]`; caps metrics at 4 items.
  - `isRenderable(block: Block): boolean` — rules from spec §2 table.
  - `normalizeCaseStudy(raw: any): { client, summary, liveUrl, blocks }` — accepts object, JSON string, null; drops null blocks.
  - `getPublishedProjects(projects)`, `findPublishedProject(projects, slug)`, `getAdjacentProjects(projects, slug): { prev, next } ` (null when < 2 published; wraps around), `getProjectSlug(project)` = `project.slug || slugify(project.title) || project.id`.

- [ ] **Step 1: Write failing tests**

```js
expect(normalizeCaseStudy(null)).toEqual({ client: '', summary: '', liveUrl: '', blocks: [] });
expect(normalizeCaseStudy('{"client":"Acme","blocks":[{"id":"a","type":"text","heading":"Hi"}]}').blocks).toHaveLength(1);
expect(normalizeCaseStudy({ blocks: [{ id: 'x', type: 'carousel' }] }).blocks).toEqual([]);
expect(normalizeBlock({ id: 'g', type: 'gallery', columns: 7, images: null })).toEqual({ id: 'g', type: 'gallery', columns: 2, images: [] });
expect(isRenderable({ type: 'text', label: 'x', heading: '', body: '' })).toBe(false);
expect(isRenderable({ type: 'image', url: '', caption: 'c' })).toBe(false);
expect(isRenderable({ type: 'metrics', items: [{ value: '32%', label: '' }] })).toBe(true);
expect(isRenderable({ type: 'quote', text: 'Great', name: '', role: '' })).toBe(true);
expect(createBlock('gallery')).toMatchObject({ type: 'gallery', columns: 2, images: [] });

const ps = [{ id: '1', slug: 'a', published: true }, { id: '2', slug: 'b', published: false }, { id: '3', slug: 'c', published: true }];
expect(findPublishedProject(ps, 'b')).toBeNull();
expect(findPublishedProject(ps, 'c').id).toBe('3');
expect(getAdjacentProjects(ps, 'a')).toEqual({ prev: ps[2], next: ps[2] });
expect(getAdjacentProjects([ps[0]], 'a')).toEqual({ prev: null, next: null });
expect(getProjectSlug({ id: 'p1', title: 'HARVASTA' })).toBe('harvasta');
```

- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement** both modules to the interfaces above.
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit** `feat: add block registry and project lookup helpers`.

### Task 3: Root-absolute asset paths

**Files:**
- Modify: `vite.config.js` (`base: '/'`), every `./assets/` reference in `index.html`, `src/App.jsx`, `src/components/{ChatView,Sidebar,ContactModal,Navbar,AboutView,BookingModal}.jsx`, `src/components/cms/{CmsLogin,CmsDashboard}.jsx`.

- [ ] **Step 1: Replace** `./assets/` → `/assets/` in those files.
- [ ] **Step 2: Verify** `grep -rn "\./assets" src index.html` → no output; `npx vite build` succeeds; `grep -o 'src="[^"]*assets[^"]*"' dist/index.html` shows paths starting with `/assets/`.
- [ ] **Step 3: Commit** `fix: use root-absolute asset paths for nested routes`.

### Task 4: Neon migration (production — confirm first)

**Files:** none (DB only). Use the Neon MCP tools (`list_projects` → find the project whose connection host matches `ep-autumn-snow-b5xiqct7`; then `run_sql` / `run_sql_transaction`).

- [ ] **Step 1: Inspect** `describe_table_schema` for `projects`; confirm `slug`/`case_study` don't exist.
- [ ] **Step 2: Ask the user in chat** to approve running the SQL below on production. Stop until they say yes.
- [ ] **Step 3: Run** in one transaction:

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study JSONB NOT NULL DEFAULT '{}'::jsonb;
```

- [ ] **Step 4: Backfill** — `SELECT id, name FROM projects ORDER BY sort, created_at`; compute slugs locally with `slugify` + `uniqueSlug` (Task 1); `UPDATE projects SET slug = $slug WHERE id = $id` per row; then `CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug);`.
- [ ] **Step 5: Verify** `SELECT id, slug FROM projects` → every row has a distinct non-empty slug.

### Task 5: Data layer reads/writes slug + case study

**Files:**
- Modify: `api/portfolio.js` (GET select/map ~L38-58, POST `project` upsert ~L178-212), `src/lib/neon.js` (select/map ~L50-69, `project` upsert ~L187-226), `src/data/portfolioData.js`

**Interfaces:**
- Consumes: `normalizeCaseStudy`, `getProjectSlug` (Task 2).
- Produces: every project object carries `slug: string` and `caseStudy: { client, summary, liveUrl, blocks }`.

- [ ] **Step 1: Reads** — add `slug, case_study` to both SELECTs; map `slug: p.slug || slugify(p.name)`, `caseStudy: normalizeCaseStudy(p.case_study)`. `api/portfolio.js` imports from `../src/lib/slug.js` and `../src/lib/blocks.js`.
- [ ] **Step 2: Writes** — add `slug` and `case_study` (`JSON.stringify(normalizeCaseStudy(p.caseStudy))`) to both INSERT column lists, VALUES and `ON CONFLICT DO UPDATE SET`.
- [ ] **Step 3: Fallback data** — add `slug` to every project in `portfolioData.js`; give the first project a full `caseStudy` with one block of each of the 6 types (realistic EvalNow copy: Challenge/Solution/Outcome as three `text` blocks labelled `01 — Challenge`, `02 — Solution`, `03 — Outcome`; metrics `48%` / `Faster grading`, `3×` / `More weekly active teachers`; reuse existing Unsplash image URLs; video block may be omitted if no video URL exists — then 5 types).
- [ ] **Step 4: Verify** `npx vite build` passes; in the browser console on `localhost:5173`, `(await (await import('/src/lib/neon.js')).fetchPortfolioFromNeon()).projects.map(p => [p.slug, p.caseStudy.blocks.length])` returns slugs for every project.
- [ ] **Step 5: Commit** `feat: persist project slug and case study`.

### Task 6: Routing + ProjectDetail page shell

**Files:**
- Create: `src/components/ProjectDetail.jsx`
- Modify: `src/App.jsx`, `src/components/WorkGrid.jsx`
- Delete: `src/components/ProjectModal.jsx`

**Interfaces:**
- Consumes: `parseRoute`, `projectPath` (Task 1); `findPublishedProject`, `getAdjacentProjects`, `getPublishedProjects`, `getProjectSlug` (Task 2).
- Produces: `<ProjectDetail project={Project|null} projects={Project[]} onOpenProject={(slug) => void} onBack={() => void} onBookCall={() => void} isLoading={boolean} />` — Task 7 inserts `<BlockRenderer blocks />` into it.

- [ ] **Step 1: App routing** — replace `getInitialTab` + the hash/popstate effect with `parseRoute`; add `projectSlug` state; `openProject(slug)` = `history.pushState(null,'',projectPath(slug))`, set view `project`, `window.scrollTo(0,0)`; `changeTab` pushes `/` + `#tab` when leaving a project path. Remove `selectedProject`, the `pointer-events-none`/`aria-hidden` wrapper logic and the `ProjectModal` render. Hide `ProfileIntro` when view is `project`. Add `isPortfolioLoading` state (true until `fetchPortfolioFromNeon` settles, success or failure) and pass it as `isLoading`. Set `document.title` to `` `${project.title} — Donny Ridwan S` `` while on a project; restore the original title on leave.
- [ ] **Step 2: WorkGrid** — render `getPublishedProjects(projects)`; card click calls `onOpenProject(getProjectSlug(project))`; render each card as `<a href={projectPath(slug)}>` with `preventDefault` + `onOpenProject` so cmd-click opens a new tab.
- [ ] **Step 3: ProjectDetail** — sections per spec §2 items 1–3, 5 (description fallback as an "Overview" text block, rendered inline until Task 7), 6 (prev/next with thumbnails + CTA band "Have a similar project in mind?" + Book a Call). Not-found view: heading "Project not found", text "This project doesn't exist or isn't published yet.", button "← Back to work". `isLoading && !project` renders nothing.
- [ ] **Step 4: Browser verify** (`preview_start` name `web`): grid click → `/work/<slug>` renders hero/cover; back button returns to grid; hard reload on `/work/<slug>` renders with logo and icons loaded; `/work/does-not-exist` shows not-found; prev/next navigate; at 375/768/1024/1280 no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`); console has no errors. `npx vite build` passes.
- [ ] **Step 5: Commit** `feat: add project detail page and path routing`.

### Task 7: Block renderer

**Files:**
- Create: `src/components/blocks/BlockRenderer.jsx`, `src/components/blocks/{TextBlock,ImageBlock,GalleryBlock,VideoBlock,MetricsBlock,QuoteBlock}.jsx`
- Modify: `src/components/ProjectDetail.jsx`

**Interfaces:**
- Consumes: `isRenderable` (Task 2), `ProjectDetail` (Task 6).
- Produces: `<BlockRenderer blocks={Block[]} />` — renders `blocks.filter(isRenderable)` in order; spacing `gap-10 md:gap-16`. Each block component takes the block object as props.

- [ ] **Step 1: Implement** the six components to the spec §2 "Block types" table (sizes, columns, captions). Gallery: `grid-cols-1 md:grid-cols-{columns}` via a static class map (`{2:'md:grid-cols-2',3:'md:grid-cols-3'}`) so Tailwind keeps the classes. Metrics: same class-map approach for 2–4 columns.
- [ ] **Step 2: Wire** — `ProjectDetail` renders `<BlockRenderer blocks={caseStudy.blocks} />`, falling back to a single `{type:'text',label:'Overview',body:project.description}` when no block is renderable.
- [ ] **Step 3: Browser verify** on the demo project from Task 5: every block type visible, captions shown, gallery columns correct at ≥768px and single column at 375px; a project with no blocks shows the Overview fallback.
- [ ] **Step 4: Commit** `feat: render case study blocks`.

### Task 8: CMS case-study fields + slug validation

**Files:**
- Create: `src/components/cms/CaseStudyFields.jsx`
- Modify: `src/components/cms/ProjectEditor.jsx`, `src/components/cms/CmsDashboard.jsx` (pass `existingSlugs`)

**Interfaces:**
- Consumes: `slugify` (Task 1), `normalizeCaseStudy` (Task 2).
- Produces: `formData.slug: string`, `formData.caseStudy: CaseStudy` in `ProjectEditor`; `<CaseStudyFields value={{slug, client, summary, liveUrl}} onChange={(patch) => void} slugError={string|null} />`; `validateSlug(slug: string, existingSlugs: string[], ownSlug: string): string | null` exported from `src/lib/slug.js` (add tests: `''` → `'Slug wajib diisi'`, `'Bad Slug'` → `'Hanya huruf kecil, angka, dan tanda -'`, taken → `'Slug sudah dipakai project lain'`, own slug → null).

- [ ] **Step 1: Failing tests** for `validateSlug` in `slug.test.js`; run → FAIL; implement; run → PASS.
- [ ] **Step 2: Editor** — init `slug` from `project.slug` (or `slugify(title)`), `caseStudy` from `normalizeCaseStudy(project.caseStudy)`; slug follows title until the slug input is edited manually (`slugTouched` flag); Live URL must be empty or start with `http`; block `handleSubmit` while any error, showing it inline in red `text-[12px]`.
- [ ] **Step 3: Dashboard** — after a successful save, show "View page ↗" link to `projectPath(slug)` (`target="_blank"`) in the success notice or editor header.
- [ ] **Step 4: Verify** in browser at `/admin` — the CMS password is the user's real credential, so ask the user to log in in the Browser pane; then check: slug auto-follows title, manual edit sticks, duplicate slug shows error and blocks save. Do not save to production in this task.
- [ ] **Step 5: Commit** `feat(cms): add case study info fields and slug validation`.

### Task 9: CMS block builder

**Files:**
- Create: `src/components/cms/BlockEditor.jsx`, `src/components/cms/blocks/{TextBlockEditor,ImageBlockEditor,GalleryBlockEditor,VideoBlockEditor,MetricsBlockEditor,QuoteBlockEditor}.jsx`
- Modify: `src/components/cms/ProjectEditor.jsx`

**Interfaces:**
- Consumes: `BLOCK_TYPES`, `createBlock` (Task 2); `MediaUploader` (`value`, `onChange`, `mediaType`); `formData.caseStudy` (Task 8).
- Produces: `<BlockEditor blocks={Block[]} onChange={(blocks: Block[]) => void} />`; each type editor `<XBlockEditor block onChange={(patch) => void} />`.

- [ ] **Step 1: BlockEditor** — "+ Add block" menu listing `BLOCK_TYPES` with icons; append `createBlock(type)`. Cards in `Reorder.Group axis="y" values={blocks} onReorder={onChange}`; each `Reorder.Item` uses `dragListener={false}` + `useDragControls`, started from a `GripVertical` handle (`onPointerDown={(e) => controls.start(e)}`, `touch-action: none` on the handle). Card header: type label, ↑/↓ (disabled at ends), Duplicate (copy with new `crypto.randomUUID()` id, inserted after), Delete (`confirm('Hapus block ini?')`). Empty state text: "Belum ada block. Tambahkan block pertama untuk mulai menyusun case study."
- [ ] **Step 2: Type editors** — fields per spec §2 table; image/video use `MediaUploader` with `mediaType` `'image'`/`'video'`; gallery has a 2/3 column toggle, "+ Tambah gambar" and per-image remove; metrics allows 1–4 rows with add/remove.
- [ ] **Step 3: Wire** into `ProjectEditor` under a "Content Blocks" heading, bound to `formData.caseStudy.blocks`.
- [ ] **Step 4: Verify** in browser (user logged in): add one of each type, drag-reorder, ↑/↓, duplicate, delete; form state reflects order (inspect via React state or by temporarily logging `formData` — remove before commit). `npx vite build` passes. No production save yet.
- [ ] **Step 5: Commit** `feat(cms): add case study block builder`.

### Task 10: Micro-animations via transitions.dev

**Files:**
- Modify: `src/components/ProjectDetail.jsx`, `src/components/blocks/*.jsx`, `src/components/WorkGrid.jsx`, `src/index.css`

- [ ] **Step 1: Ask the user** to approve running `npx skills add Jakubantalik/transitions.dev` (downloads from npm). Stop until yes.
- [ ] **Step 2: Install and review** — run it; invoke the skill's `transitions review`; save findings to the scratchpad.
- [ ] **Step 3: Apply** recipes (using the skill's tokens/durations, not ad-hoc values) to: detail page enter; blocks reveal on scroll with stagger (framer-motion `whileInView`, `viewport={{ once: true, margin: '-80px' }}`); metrics values with the library's **Number pop-in** recipe; WorkGrid card and prev/next hover; CTA button. Every animation gated by `useReducedMotion()` or `@media (prefers-reduced-motion: reduce)`.
- [ ] **Step 4: Verify** in browser normal + emulated reduced motion (`matchMedia('(prefers-reduced-motion: reduce)')` override or DevTools): animations run / are disabled; no layout shift; build passes.
- [ ] **Step 5: Commit** `feat: add micro-interactions from transitions.dev`.

### Task 11: End-to-end verification with a real save

- [ ] **Step 1: Ask the user** for permission to create a temporary unpublished project in production via the CMS (and for them to log in).
- [ ] **Step 2: Create** project "ZZ Test Case Study" (`published: false`) with one block of each type; save; confirm the row in Neon (`SELECT slug, case_study FROM projects WHERE name = 'ZZ Test Case Study'`) has all blocks in order.
- [ ] **Step 3: Publish briefly**, open `/work/zz-test-case-study`, confirm all blocks render; then **delete** the project via the CMS and confirm the row is gone.
- [ ] **Step 4: Full sweep** — `npm test`, `npx vite build`, all `/work/<slug>` at 375/768/1024/1280, back/forward, not-found, console clean.
- [ ] **Step 5: Report** to the user; push only when they ask.

# Donny Ridwan S — Personal Portfolio

Live UI/UX & Web Designer portfolio, built directly from the [Figma Design](https://www.figma.com/design/5GrsSURVQorjBqvW6mrPg2/Personal-Website?node-id=1-2).

## 🚀 Live Demo
- **Live URL**: [https://donnyridwan.github.io/personal-portfolio/](https://donnyridwan.github.io/personal-portfolio/)

## ✨ Key Features
- **High-Fidelity Match**: Implemented exactly according to the Figma specification with pixel-perfect typography, colors, and layout.
- **Interactive Chat Assistant ("Jhonny Helper")**: Real-time simulated chatbot with interactive responses about services, process, tools, and pricing.
- **15-Min Meeting Scheduler**: Interactive modal to select dates, topics, and book calls.
- **Masonry Project Grid**: Dual-column layout with case study previews and detail views.
- **Mobile Responsive**: Adapts seamlessly from desktop (1440px) to mobile devices.
- **Asset Management**: All vectors, custom icons, and images hosted locally with high performance.

## 🛠 Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons & Graphics**: Custom SVG vectors + Figma assets
- **Effects**: Glassmorphism, radial gradient glows, confetti

## 💻 Local Development
```bash
npm install
npm run dev
```

To build for production:
```bash
npm run build
npm run preview
```

## 🔐 Environment Variables & CMS

Portfolio content lives in Neon Postgres and is edited through the CMS at `/admin`.
The browser **never** talks to the database directly — all reads and writes go through
the Vercel serverless functions in `api/`:

- `GET /api/portfolio` — public read (the site falls back to `src/data/portfolioData.js` if it fails)
- `POST /api/auth` — exchanges the admin password for a signed, expiring session token
- `POST /api/portfolio` — writes; requires `Authorization: Bearer <token>` from `/api/auth`

Required server-only env vars (set in Vercel → Project Settings → Environment Variables;
see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string, used only by `api/portfolio.js` |
| `CMS_ADMIN_PASSWORD` | CMS login password, checked only by `api/auth.js` |
| `CMS_AUTH_SECRET` | Secret for signing CMS session tokens (recommended; falls back to `CMS_ADMIN_PASSWORD`) |

> ⚠️ Never put secrets in `VITE_*` variables — Vite inlines them into the public JS bundle.

### Working on the CMS locally

`npm run dev` (plain Vite) does **not** serve `/api`, so the site shows the static
fallback data and the CMS can't log in or save. For CMS work, use the Vercel CLI,
which runs Vite and the `api/` functions together:

```bash
npm i -g vercel
vercel link        # link to the Vercel project once
vercel env pull    # writes server env vars to .env.local
vercel dev
```

> The GitHub Pages build (`npm run deploy`) is static-only: it has no `/api`, so it
> always shows the fallback data from `src/data/portfolioData.js`.

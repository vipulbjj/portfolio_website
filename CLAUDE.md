# portfolio_website — CLAUDE.md

## What this is

Vipul Bajaj's personal portfolio site at vipulbajaj.com. Vanilla HTML/CSS/JavaScript — no framework, no build step.

## Stack

- **Framework**: None — vanilla HTML, CSS, JavaScript
- **Language**: JavaScript (+ Python for blog generation script)
- **Styling**: Custom CSS (`styles.css`) — no utility framework
- **DB**: None
- **Auth**: None
- **Hosting**: TODO — Vipul, where is this deployed? (Vercel, GitHub Pages, Cloudflare Pages?)
- **Other**: `scripts/generate_blog.py` uses OpenAI API to generate blog content

## Commands

```bash
# No build step — open index.html directly in browser

# Blog content generation (requires OPENAI_API_KEY in env)
python scripts/generate_blog.py
```

No install, test, lint, or typecheck commands.

## Project structure

```
portfolio_website/
├── index.html        # Main portfolio page (OG/Twitter meta, JSON-LD schema, all content)
├── writing.html      # Writing / blog section
├── styles.css        # All styles
├── script.js         # Client-side JS
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── data/
│   └── blogs.json    # Blog post data (consumed by writing.html)
└── scripts/
    └── generate_blog.py  # OpenAI-powered blog content generator
```

## Conventions

- No build pipeline — what you edit is exactly what ships
- `data/blogs.json` is the data source for the writing page — keep it valid JSON
- SEO metadata (OG tags, JSON-LD `Person` schema) lives in `index.html` `<head>` — update when making profile changes
- No `<script type="module">` imports from npm — if adding JS dependencies, inline them or use a CDN link

## Git workflow

- Branches: `vipul/<short-description>` for solo work
- Commit style: conventional commits (`feat:`, `fix:`, `chore:`)

## Deploy

- Hosting: Vercel
- Production: auto-deploys on push to `main`
- Live at: https://vipulbajaj.com

## Testing philosophy

No automated tests — manually verify in browser before pushing.

## Things that are out of scope

- TODO: Vipul, anything to keep off the portfolio site?

## Known gotchas

- No bundler — any JS dependencies must come from `<script>` tags or ES module imports; no `import from 'npm-package'`
- `generate_blog.py` requires `OPENAI_API_KEY` env var — won't run without it

## Product context

- **Audience**: Potential employers, collaborators, researchers, and intellectual peers
- **Voice**: Academic, founder, and co-founder — intellectually focused, motivated, and accomplished. Precise and confident without being boastful.
- **What we'd never say**: Anything vague or self-deprecating. Vipul is a high-achiever; the site should reflect that without overselling.

## Decision log

Log significant architectural decisions here so they're not relitigated.

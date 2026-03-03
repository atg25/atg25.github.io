# AutoBlog (Andy's Archive)

A Next.js blog that renders Markdown posts from the `posts/` folder and adds Google sign-in (NextAuth) plus likes, saves, comments, and a simple user dashboard (Prisma + Postgres/Supabase).

## What this project does

- **Static content**: Blog posts are Markdown files in `posts/`.
- **Rendering**: Markdown is converted to HTML at build time using `remark`.
- **Auth**: “Sign in with Google” via NextAuth (database sessions).
- **Engagement**: Signed-in users can **like**, **save**, and **comment** on posts.
- **Dashboard**: Signed-in users can view their saved posts, liked posts, and comments.

## How it works (high level)

### 1) Content pipeline (Markdown → pages)

- Posts live in `posts/*.md`.
- Each post supports frontmatter:
  - `title` (string)
  - `date` (string)
  - `excerpt` (string)
- Build-time helpers in `lib/posts.js`:
  - `getSortedPostsData()` builds the list for the blog index
  - `getPostData(slug)` converts markdown → HTML for the post page

Pages:

- Home: `pages/index.js` (reads `content/home.md` + shows recent posts)
- Blog index: `pages/blog/index.js`
- Post page: `pages/blog/[slug].js`

### 2) Database-backed engagement (posts table + interactions)

The site pages are generated from Markdown, but likes/saves/comments are stored in Postgres.

- Prisma schema: `prisma/schema.prisma`
- Models (simplified): `User`, `Post`, `Like`, `Save`, `Comment`, plus NextAuth tables.

Important detail:

- Interaction endpoints require a `posts` table row. When a user interacts with a slug, the server calls `ensurePostRecord(slug)` from `lib/posts-db.js`.
- `ensurePostRecord` verifies the slug maps to a real Markdown file (via `getPostData`) and **upserts** the `Post` record with the current title.

### 3) Authentication (NextAuth + Prisma adapter)

- NextAuth config: `lib/auth.js`
- NextAuth route: `pages/api/auth/[...nextauth].js`
- Session strategy: **database** sessions

UI:

- Navbar auth controls: `components/AuthControls.js`
- Sign in button: `components/GoogleSignInButton.js`

### 4) API routes

All API routes are in `pages/api/`.

#### Comments

- `GET /api/comments?postSlug=...`
  - Returns `{ comments: [...] }`
  - Does **not** require auth
- `POST /api/comments`
  - Body: `{ postSlug, content }`
  - Requires auth
  - Rate limited (see `lib/rate-limit.js`)

#### Likes

- `GET /api/likes?postSlug=...`
  - Requires auth (when the post exists in DB)
  - Returns `{ liked, likeCount }`
- `POST /api/likes`
  - Body: `{ postSlug }`
  - Requires auth
  - Toggles like; returns `{ liked, likeCount }`

#### Saves

- `GET /api/saves?postSlug=...`
  - Requires auth (when the post exists in DB)
  - Returns `{ saved }`
- `POST /api/saves`
  - Body: `{ postSlug }`
  - Requires auth
  - Toggles save; returns `{ saved }`

#### Dashboard

- `GET /api/user/dashboard`
  - Requires auth
  - Returns the current user, saved posts, liked posts, and comments

### 5) Styling / layout

- Global styles live in `styles/globals.css`.
- Layout wrapper + header/footer: `components/Layout.js`.

## Local development

### Prerequisites

- Node.js 18+ recommended
- A Postgres database (Supabase is the intended host)
- Google OAuth credentials (Client ID/Secret)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

Required in production (and recommended locally):

- `DATABASE_URL` — Postgres connection string
- `DIRECT_URL` — direct/session connection string used for migrations (Supabase)
- `NEXTAUTH_SECRET` — random secret
- `NEXTAUTH_URL` — `http://localhost:3000` locally
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3) Create DB schema

```bash
npx prisma generate
npx prisma migrate dev
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Adding a new post

1. Create a new file in `posts/` like `my-new-post.md`
2. Add frontmatter:

```md
---
title: "My New Post"
date: "2026-03-03"
excerpt: "A short summary shown in lists."
---

Your content here...
```

1. Commit + push. The pages will render from the markdown.

## Deployment (Vercel + Supabase)

This app uses API routes and OAuth, so it must run on a server platform (Vercel recommended).

Checklist:

1. Create a Supabase Postgres project
2. Set Vercel environment variables (`Settings → Environment Variables`)
3. Ensure Google OAuth callback URL(s) include your Vercel domain:
   - `https://<your-domain>/api/auth/callback/google`
4. Run migrations in production (the build script attempts to do this automatically)

### Supabase pooling note (important)

If you use Supabase’s pooler:

- Use the transaction pooler for `DATABASE_URL` (often port `6543`).
- Use a direct or session connection for `DIRECT_URL` so migrations can run reliably.

The Prisma client also normalizes Supabase pooler URLs at runtime in `lib/prisma.js`.

## Security / behavior notes

- Interaction endpoints require a valid server session (see `lib/server-auth.js`).
- Basic IP-based rate limiting is implemented in `lib/rate-limit.js`.
- Standard security headers are configured in `next.config.js`.

## Project structure

```text
components/         UI building blocks (Layout, auth controls, interactions)
content/            Home page markdown
lib/                Markdown pipeline, auth config, prisma client, helpers
pages/              Next.js pages + API routes
posts/              Blog post markdown files
prisma/             Prisma schema + migrations
scripts/            Build + post sync helpers (used in deploy)
styles/             Global CSS
```

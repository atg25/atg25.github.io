---
title: "How to Write a New Post"
date: "2026-02-19"
excerpt: "A quick guide to adding content to this blog."
---

Adding a new post is as simple as creating a new Markdown file.

## Steps

1. Create a file in the `posts/` directory — e.g. `my-new-post.md`
2. Add the frontmatter block at the top
3. Write your content in Markdown
4. Commit and push to `main`

GitHub Actions will pick it up, rebuild the site, and deploy within a minute or two.

## Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title shown everywhere |
| `date` | Yes | ISO date — used for sorting |
| `excerpt` | No | Short preview shown in lists |

## Home page

The home page is controlled entirely by `content/home.md`. Edit that file to change the hero text, subtitle, or the number of recent posts displayed.

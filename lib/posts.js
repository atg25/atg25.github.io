import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const postsDir = path.join(process.cwd(), "posts");
const contentDir = path.join(process.cwd(), "content");

// ── Blog posts ──────────────────────────────────────────────

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDir, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? String(data.date) : "",
      excerpt: data.excerpt || "",
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return fileNames.map((fileName) => ({
    params: { slug: fileName.replace(/\.md$/, "") },
  }));
}

export async function getPostData(slug) {
  const fullPath = path.join(postsDir, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processed = await remark().use(remarkHtml).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    contentHtml,
    title: data.title || slug,
    date: data.date ? String(data.date) : "",
    excerpt: data.excerpt || "",
  };
}

// ── Home page (content/home.md) ──────────────────────────────

export async function getHomeContent() {
  const fullPath = path.join(contentDir, "home.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processed = await remark().use(remarkHtml).process(content);
  const contentHtml = processed.toString();

  return {
    contentHtml,
    title: data.title || "Home",
    subtitle: data.subtitle || "",
    showRecentPosts: data.showRecentPosts !== false,
    recentPostsCount: data.recentPostsCount || 5,
  };
}

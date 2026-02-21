import Layout from "../components/Layout";
import Link from "next/link";
import { getHomeContent, getSortedPostsData } from "../lib/posts";

export default function Home({ home, recentPosts }) {
  return (
    <Layout title="Andy's Archive" description={home.subtitle}>
      {home.subtitle && <p className="hero-subtitle">{home.subtitle}</p>}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: home.contentHtml }}
      />

      {home.showRecentPosts && recentPosts.length > 0 && (
        <section className="recent-posts">
          <h2>Recent Posts</h2>
          <ul className="posts-list">
            {recentPosts.map((post) => (
              <li key={post.slug} className="post-item">
                <Link href={`/blog/${post.slug}`} className="post-link">
                  <span className="post-title">{post.title}</span>
                  <span className="post-date">{post.date}</span>
                </Link>
                {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
              </li>
            ))}
          </ul>
          <Link href="/blog" className="view-all">
            View all posts →
          </Link>
        </section>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const home = await getHomeContent();
  const allPosts = getSortedPostsData();
  const recentPosts = allPosts.slice(0, home.recentPostsCount);

  return {
    props: {
      home,
      recentPosts,
    },
  };
}

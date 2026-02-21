import Layout from "../components/Layout";
import Link from "next/link";
import { getHomeContent, getSortedPostsData } from "../lib/posts";

export default function Home({ home, recentPosts }) {
  return (
    <Layout title="Andy's Archive" description={home.subtitle}>
      <section className="hero">
        <div className="swiss-grid">
          <div className="hero-media">
            <div className="hero-blob" aria-hidden="true" />
          </div>

          <div className="hero-type">
            <h1 className="hero-title">
              ANDY'S <br />
              <span className="hero-accent">ARCHIVE</span> <br />
              FORM.
            </h1>

            <div className="hero-panel">
              <p className="hero-kicker">Principles</p>
              <p className="hero-desc">
                {home.subtitle ||
                  "Swiss precision with organic warmth — built to breathe."}
              </p>
            </div>

            <Link href="/blog" className="hero-cta">
              Explore Posts
            </Link>
          </div>
        </div>
      </section>

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

import Head from 'next/head';
import Link from 'next/link';
import { getHomeContent, getSortedPostsData } from '../lib/posts';

export default function Home({ home, recentPosts }) {
  return (
    <>
      <Head>
        <title>{home.title}</title>
        <meta name="description" content={home.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="site-wrapper">
        <header className="site-header">
          <nav className="nav">
            <Link href="/" className="nav-brand">{home.title}</Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </nav>
        </header>

        <main className="main">
          {home.subtitle && (
            <p className="hero-subtitle">{home.subtitle}</p>
          )}

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
                    {post.excerpt && (
                      <p className="post-excerpt">{post.excerpt}</p>
                    )}
                  </li>
                ))}
              </ul>
              <Link href="/blog" className="view-all">View all posts →</Link>
            </section>
          )}
        </main>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} · Built with Next.js</p>
        </footer>
      </div>
    </>
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

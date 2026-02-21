import Head from 'next/head';
import Link from 'next/link';
import { getSortedPostsData } from '../../lib/posts';

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>Blog</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="site-wrapper">
        <header className="site-header">
          <nav className="nav">
            <Link href="/" className="nav-brand">My Blog</Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </nav>
        </header>

        <main className="main">
          <h1>All Posts</h1>
          {posts.length === 0 ? (
            <p>No posts yet. Add a <code>.md</code> file to the <code>posts/</code> folder.</p>
          ) : (
            <ul className="posts-list">
              {posts.map((post) => (
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
  const posts = getSortedPostsData();
  return { props: { posts } };
}

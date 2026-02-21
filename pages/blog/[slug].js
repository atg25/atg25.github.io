import Head from 'next/head';
import Link from 'next/link';
import { getAllPostSlugs, getPostData } from '../../lib/posts';

export default function Post({ postData }) {
  return (
    <>
      <Head>
        <title>{postData.title}</title>
        <meta name="description" content={postData.excerpt} />
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
          <article className="post-full">
            <header className="post-header">
              <h1>{postData.title}</h1>
              {postData.date && (
                <time className="post-date">{postData.date}</time>
              )}
            </header>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
            />
          </article>
          <div className="post-nav">
            <Link href="/blog">← Back to all posts</Link>
          </div>
        </main>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} · Built with Next.js</p>
        </footer>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostSlugs();
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  return { props: { postData } };
}

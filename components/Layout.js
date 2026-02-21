import Head from 'next/head';
import Link from 'next/link';

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/atg25' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andrew-gardner2026/' },
  { label: 'Website', href: 'https://andrewg.vercel.app' },
];

export default function Layout({ children, title = "Andy's Archive", description = '' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="site-wrapper">
        <header className="site-header">
          <nav className="nav">
            <Link href="/" className="nav-brand">Andy's Archive</Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </nav>
        </header>

        <main className="main">{children}</main>

        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-social">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} Andrew Gardner</p>
          </div>
        </footer>
      </div>
    </>
  );
}

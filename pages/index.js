import Layout from "../components/Layout";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getHomeContent, getSortedPostsData } from "../lib/posts";

export default function Home({ home, recentPosts }) {
  const blobRef = useRef(null);

  useEffect(() => {
    const el = blobRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let rect = null;
    let rafId = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const clamp01 = (n) => Math.min(1, Math.max(0, n));

    const apply = () => {
      rafId = 0;
      if (!rect) rect = el.getBoundingClientRect();

      const x = clamp01((lastClientX - rect.left) / rect.width);
      const y = clamp01((lastClientY - rect.top) / rect.height);

      const mx = `${(x * 100).toFixed(2)}%`;
      const my = `${(y * 100).toFixed(2)}%`;
      el.style.setProperty("--blob-mx", mx);
      el.style.setProperty("--blob-my", my);

      const nx = x - 0.5;
      const ny = y - 0.5;
      const tilt = 8;
      el.style.setProperty("--blob-tilt-x", `${(-ny * tilt).toFixed(2)}deg`);
      el.style.setProperty("--blob-tilt-y", `${(nx * tilt).toFixed(2)}deg`);
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(apply);
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };

    const onMove = (e) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      schedule();
    };

    const onLeave = () => {
      rect = null;
      el.style.setProperty("--blob-mx", "50%");
      el.style.setProperty("--blob-my", "50%");
      el.style.setProperty("--blob-tilt-x", "0deg");
      el.style.setProperty("--blob-tilt-y", "0deg");
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <Layout title="Andy's Archive" description={home.subtitle}>
      <section className="hero">
        <div className="swiss-grid">
          <div className="hero-media">
            <div className="hero-blob" ref={blobRef} aria-hidden="true" />
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

      <section className="home-section">
        <div className="swiss-grid">
          <div className="home-spacer" aria-hidden="true" />
          <div
            className="prose home-prose"
            dangerouslySetInnerHTML={{ __html: home.contentHtml }}
          />
        </div>
      </section>

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

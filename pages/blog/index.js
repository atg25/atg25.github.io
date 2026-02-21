import Layout from "../../components/Layout";
import Link from "next/link";
import { getSortedPostsData } from "../../lib/posts";

export default function BlogIndex({ posts }) {
  return (
    <Layout title="Blog — Andy's Archive">
      <h1>All Posts</h1>
      {posts.length === 0 ? (
        <p>
          No posts yet. Add a <code>.md</code> file to the <code>posts/</code>{" "}
          folder.
        </p>
      ) : (
        <ul className="posts-list">
          {posts.map((post) => (
            <li key={post.slug} className="post-item">
              <Link href={`/blog/${post.slug}`} className="post-link">
                <span className="post-title">{post.title}</span>
                <span className="post-date">{post.date}</span>
              </Link>
              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return { props: { posts } };
}

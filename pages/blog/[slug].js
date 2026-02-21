import Layout from "../../components/Layout";
import Link from "next/link";
import { getAllPostSlugs, getPostData } from "../../lib/posts";

export default function Post({ postData }) {
  return (
    <Layout
      title={`${postData.title} — Andy's Archive`}
      description={postData.excerpt}
    >
      <article className="post-full">
        <header className="post-header">
          <h1>{postData.title}</h1>
          {postData.date && <time className="post-date">{postData.date}</time>}
        </header>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
      <div className="post-nav">
        <Link href="/blog">← Back to all posts</Link>
      </div>
    </Layout>
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

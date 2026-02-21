import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "../components/Layout";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const response = await fetch("/api/user/dashboard");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load dashboard.");
        }
        const payload = await response.json();
        if (!ignore) {
          setData(payload);
          setError("");
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [status]);

  if (status === "loading") {
    return (
      <Layout title="Dashboard — Andy's Archive">
        <p>Loading session…</p>
      </Layout>
    );
  }

  if (!session?.user) {
    return (
      <Layout title="Dashboard — Andy's Archive">
        <section className="dashboard-auth">
          <h1>Your Dashboard</h1>
          <p>Sign in with Google to view your likes, saves, and comments.</p>
          <GoogleSignInButton />
        </section>
      </Layout>
    );
  }

  const user = data?.user || session.user;
  const savedPosts = data?.savedPosts || [];
  const likedPosts = data?.likedPosts || [];
  const comments = data?.comments || [];

  return (
    <Layout title="Dashboard — Andy's Archive">
      <section className="dashboard-header">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="" className="dashboard-avatar" />
        ) : (
          <div className="dashboard-avatar dashboard-avatar-fallback" aria-hidden="true" />
        )}
        <div>
          <h1>{user.name || "My Dashboard"}</h1>
          <p>{user.email}</p>
        </div>
      </section>

      {error && <p className="dashboard-error">{error}</p>}
      {loading ? (
        <p>Loading dashboard…</p>
      ) : (
        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h2>My Saved Posts</h2>
            {savedPosts.length === 0 ? (
              <p className="dashboard-empty">No saved posts yet.</p>
            ) : (
              <ul>
                {savedPosts.map((item) => (
                  <li key={`${item.userId}-${item.postId}`}>
                    <Link href={`/blog/${item.post.slug}`}>{item.post.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Posts I Liked</h2>
            {likedPosts.length === 0 ? (
              <p className="dashboard-empty">No liked posts yet.</p>
            ) : (
              <ul>
                {likedPosts.map((item) => (
                  <li key={`${item.userId}-${item.postId}`}>
                    <Link href={`/blog/${item.post.slug}`}>{item.post.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-card">
            <h2>My Comments</h2>
            {comments.length === 0 ? (
              <p className="dashboard-empty">No comments yet.</p>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <p className="dashboard-comment-text">{comment.content}</p>
                    <p className="dashboard-comment-meta">
                      On <Link href={`/blog/${comment.post.slug}`}>{comment.post.title}</Link> · {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}

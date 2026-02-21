import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import GoogleSignInButton from "./GoogleSignInButton";

export default function PostInteractions({ postSlug }) {
  const { data: session, status } = useSession();
  const isAuthed = Boolean(session?.user);

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");
  const [interactionError, setInteractionError] = useState("");
  const [busyLike, setBusyLike] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [busyComment, setBusyComment] = useState(false);

  const canSubmitComment = useMemo(() => {
    return isAuthed && commentInput.trim().length > 0 && !busyComment;
  }, [isAuthed, commentInput, busyComment]);

  useEffect(() => {
    let ignore = false;

    async function loadComments() {
      try {
        const response = await fetch(
          `/api/comments?postSlug=${encodeURIComponent(postSlug)}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!ignore) {
          setComments(Array.isArray(data.comments) ? data.comments : []);
        }
      } catch {
        if (!ignore) {
          setComments([]);
        }
      }
    }

    loadComments();
    return () => {
      ignore = true;
    };
  }, [postSlug]);

  useEffect(() => {
    if (!isAuthed) {
      setLiked(false);
      setSaved(false);
      return;
    }

    let ignore = false;

    async function loadInteractionState() {
      try {
        const [likeRes, saveRes] = await Promise.all([
          fetch(`/api/likes?postSlug=${encodeURIComponent(postSlug)}`),
          fetch(`/api/saves?postSlug=${encodeURIComponent(postSlug)}`),
        ]);

        if (!ignore && likeRes.ok) {
          const likeData = await likeRes.json();
          setLiked(Boolean(likeData.liked));
          setLikeCount(
            Number.isFinite(likeData.likeCount) ? likeData.likeCount : 0,
          );
        }

        if (!ignore && saveRes.ok) {
          const saveData = await saveRes.json();
          setSaved(Boolean(saveData.saved));
        }
      } catch {
        if (!ignore) {
          setLiked(false);
          setSaved(false);
        }
      }
    }

    loadInteractionState();

    return () => {
      ignore = true;
    };
  }, [isAuthed, postSlug]);

  async function toggleLike() {
    if (!isAuthed || busyLike) return;
    setInteractionError("");
    setBusyLike(true);
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setInteractionError(data.error || "Unable to update like.");
        return;
      }
      const data = await response.json();
      setLiked(Boolean(data.liked));
      setLikeCount(Number.isFinite(data.likeCount) ? data.likeCount : 0);
    } finally {
      setBusyLike(false);
    }
  }

  async function toggleSave() {
    if (!isAuthed || busySave) return;
    setInteractionError("");
    setBusySave(true);
    try {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setInteractionError(data.error || "Unable to update save.");
        return;
      }
      const data = await response.json();
      setSaved(Boolean(data.saved));
    } finally {
      setBusySave(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    setCommentError("");

    if (!canSubmitComment) return;

    setBusyComment(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          content: commentInput,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setCommentError(data.error || "Unable to post comment.");
        return;
      }

      const data = await response.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentInput("");
      }
    } finally {
      setBusyComment(false);
    }
  }

  return (
    <section className="post-interactions">
      <div className="interaction-row">
        <button
          type="button"
          className={`interaction-button ${liked ? "is-active" : ""}`.trim()}
          onClick={toggleLike}
          disabled={!isAuthed || busyLike}
        >
          {liked ? "♥ Liked" : "♡ Like"}{" "}
          <span className="interaction-count">{likeCount}</span>
        </button>

        <button
          type="button"
          className={`interaction-button ${saved ? "is-active" : ""}`.trim()}
          onClick={toggleSave}
          disabled={!isAuthed || busySave}
        >
          {saved ? "✓ Saved" : "＋ Save"}
        </button>
      </div>

      {!isAuthed && status !== "loading" && (
        <div className="interaction-signin">
          <p>Sign in to like, save, and comment.</p>
          <GoogleSignInButton />
        </div>
      )}

      <form className="comment-form" onSubmit={submitComment}>
        <label htmlFor="comment" className="comment-label">
          Add a comment
        </label>
        <textarea
          id="comment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder={
            isAuthed ? "Share your thoughts..." : "Sign in to comment"
          }
          maxLength={2000}
          disabled={!isAuthed || busyComment}
        />
        <div className="comment-form-footer">
          <button
            type="submit"
            className="auth-button"
            disabled={!canSubmitComment}
          >
            {busyComment ? "Posting..." : "Post Comment"}
          </button>
          {commentError && <p className="comment-error">{commentError}</p>}
        </div>
      </form>

      {interactionError && <p className="comment-error">{interactionError}</p>}

      <div className="comments-list">
        <h3>Comments</h3>
        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <div className="comment-head">
                {comment.user?.profilePicture ? (
                  <img
                    src={comment.user.profilePicture}
                    alt=""
                    className="comment-avatar"
                  />
                ) : (
                  <div
                    className="comment-avatar comment-avatar-fallback"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="comment-author">
                    {comment.user?.name || "User"}
                  </p>
                  <time className="comment-time">
                    {new Date(comment.createdAt).toLocaleString()}
                  </time>
                </div>
              </div>
              <p className="comment-content">{comment.content}</p>
            </article>
          ))
        )}
      </div>

      {isAuthed && (
        <p className="interaction-dashboard-link">
          View all activity in <Link href="/dashboard">your dashboard</Link>.
        </p>
      )}
    </section>
  );
}

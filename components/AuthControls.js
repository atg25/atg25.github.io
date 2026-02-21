import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import GoogleSignInButton from "./GoogleSignInButton";

export default function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="auth-loading">Session…</span>;
  }

  if (!session?.user) {
    return <GoogleSignInButton className="auth-nav-button" />;
  }

  return (
    <div className="auth-controls">
      <Link href="/dashboard" className="auth-link">
        Dashboard
      </Link>
      <button
        type="button"
        className="auth-link auth-signout"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </button>
    </div>
  );
}

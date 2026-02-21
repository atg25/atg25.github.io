import { signIn } from "next-auth/react";

export default function GoogleSignInButton({
  label = "Sign in with Google",
  className = "",
}) {
  return (
    <button
      type="button"
      className={`auth-button ${className}`.trim()}
      onClick={() => signIn("google")}
    >
      {label}
    </button>
  );
}

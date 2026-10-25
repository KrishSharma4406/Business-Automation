"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "@/src/app/landing.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Authentication failed. Invalid operator credentials.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google authentication failed. Try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="az-auth-card">
      <div className="az-auth-head">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span className="az-tag az-tag-emerald">
            <span className="az-status-dot" />
            NODE ACCESS
          </span>
          <span className="az-tag">CORE // SECURE</span>
        </div>
        <h1 className="az-auth-title">Authenticate Operator</h1>
        <p className="az-auth-desc">Enter access credentials to connect to the Autozip runtime workspace.</p>
      </div>

      {error && (
        <div className="az-auth-error">
          [AUTH_ERROR] {error}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="az-google-btn"
      >
        <GoogleIcon />
        {googleLoading ? "Connecting via Google..." : "Continue with Google"}
      </button>

      <div className="az-auth-divider">
        <span>or authenticate with credentials</span>
      </div>

      <form onSubmit={handleSubmit} className="az-auth-form">
        <div className="az-field">
          <label htmlFor="email" className="az-field-label">
            Operator Identity // Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@autozip.local"
            required
            className="az-field-input"
          />
        </div>

        <div className="az-field">
          <label htmlFor="password" className="az-field-label">
            Access Key // Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="az-field-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="az-auth-submit-btn"
        >
          {loading ? "Authenticating Node..." : "Authenticate & Connect"}
        </button>
      </form>

      <div className="az-auth-footer">
        <div>
          New operator?{" "}
          <Link href="/auth/register">
            Initialize Workspace Node
          </Link>
        </div>
        <div style={{ color: "var(--az-text-muted)", fontSize: "10px" }}>
          TLS 1.3 // Neon Serverless Postgres Encrypted
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="az-auth-page">
      <nav className="az-auth-navbar">
        <div className="az-auth-nav-inner">
          <Link href="/" className="az-brand">
            <span className="az-brand-name">AUTOZIP</span>
            <span className="az-brand-spec">SYS.VER 2.4</span>
          </Link>
          <Link href="/" className="az-btn-secondary" style={{ fontSize: "11px", padding: "6px 12px" }}>
            Return to Root
          </Link>
        </div>
      </nav>

      <main className="az-auth-main">
        <Suspense fallback={<div className="az-mono" style={{ color: "var(--az-text-muted)" }}>Loading Access Node...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
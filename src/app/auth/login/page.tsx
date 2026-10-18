"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "@/src/app/landing.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
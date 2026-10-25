"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Access keys do not match. Verify password entry.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Workspace node provisioning failed.");
      }

      // Automatically authenticate session and go directly to main dashboard
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during node provisioning.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google authentication failed. Try again.");
      setGoogleLoading(false);
    }
  }

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
        <div className="az-auth-card">
          <div className="az-auth-head">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="az-tag az-tag-emerald">
                <span className="az-status-dot" />
                NEW PROVISIONING
              </span>
              <span className="az-tag">WORKSPACE NODE</span>
            </div>
            <h1 className="az-auth-title">Deploy Workspace</h1>
            <p className="az-auth-desc">Provision your isolated Neon PostgreSQL cluster and autonomous ingestion runtime.</p>
          </div>

          {error && (
            <div className="az-auth-error">
              [PROVISION_FAILED] {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="az-google-btn"
          >
            <GoogleIcon />
            {googleLoading ? "Provisioning via Google..." : "Deploy with Google"}
          </button>

          <div className="az-auth-divider">
            <span>or provision with credentials</span>
          </div>

          <form onSubmit={handleSubmit} className="az-auth-form">
            <div className="az-field">
              <label htmlFor="name" className="az-field-label">
                Operator / Business Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Acme Autonomous Ops"
                required
                className="az-field-input"
              />
            </div>

            <div className="az-field">
              <label htmlFor="email" className="az-field-label">
                Operator Identity // Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="operator@company.com"
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
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                className="az-field-input"
              />
            </div>

            <div className="az-field">
              <label htmlFor="confirm" className="az-field-label">
                Confirm Access Key
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Confirm password"
                required
                className="az-field-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="az-auth-submit-btn"
            >
              {loading ? "Provisioning & Connecting..." : "Deploy Workspace Node"}
            </button>
          </form>

          <div className="az-auth-footer">
            <div>
              Existing operator?{" "}
              <Link href="/auth/login">
                Authenticate Existing Node
              </Link>
            </div>
            <div style={{ color: "var(--az-text-muted)", fontSize: "10px" }}>
              Zero Lock-in // Multi-tenant PostgreSQL Storage Segregation
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

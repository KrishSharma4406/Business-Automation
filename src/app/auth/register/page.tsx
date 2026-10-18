"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/src/app/landing.css";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
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
          email: formData.get("email"),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Workspace node provisioning failed.");
      }

      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during node provisioning.");
    } finally {
      setLoading(false);
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
              {loading ? "Provisioning Cluster..." : "Deploy Workspace Node"}
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

"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

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
      setError("Invalid email or password");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: "380px",
        padding: "32px",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <p
        style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "6px",
          color: "var(--text-primary)",
        }}
      >
        Welcome back
      </p>

      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "24px",
          fontSize: "13px",
        }}
      >
        Sign in to Autozip
      </p>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "var(--radius-md)",
            background: "var(--red-subtle)",
            border: "1px solid rgba(231, 76, 60, 0.25)",
            color: "var(--red)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <label
        htmlFor="email"
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        Email
      </label>

      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@autozip.local"
        required
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px 12px",
          marginBottom: "16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-input)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
        }}
      />

      <label
        htmlFor="password"
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        Password
      </label>

      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="admin123"
        required
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px 12px",
          marginBottom: "20px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-input)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "13px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
        padding: "20px",
      }}
    >
      <Suspense
        fallback={
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
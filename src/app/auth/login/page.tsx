"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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

    router.push("/dashboard/settings/integrations");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          borderRadius: "16px",
          background: "#151515",
          border: "1px solid #292929",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            color: "#999",
            marginBottom: "28px",
          }}
        >
          Sign in to Autoleep
        </p>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#351717",
              color: "#ff7777",
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
          }}
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="admin@autozip.local"
          required
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#0d0d0d",
            color: "#ffffff",
          }}
        />

        <label
          htmlFor="password"
          style={{
            display: "block",
            marginBottom: "6px",
          }}
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="admin123"
          required
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px",
            marginBottom: "22px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#0d0d0d",
            color: "#ffffff",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "#ffffff",
            color: "#000000",
            fontWeight: 600,
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
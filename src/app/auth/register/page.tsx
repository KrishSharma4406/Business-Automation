"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
      setError("Passwords do not match");
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
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
          Create account
        </p>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "24px",
            fontSize: "13px",
          }}
        >
          Sign up for Autozip
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

        <FormField label="Name" name="name" placeholder="Your name" required />
        <FormField label="Email" name="email" type="email" placeholder="you@example.com" required />
        <FormField label="Password" name="password" type="password" placeholder="Create a password" required />
        <FormField label="Confirm Password" name="confirm" type="password" placeholder="Confirm password" required />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "4px",
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
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <a
            href="/auth/login"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-input)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
        }}
      />
    </div>
  );
}

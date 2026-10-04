"use client";

import TopBar from "@/src/components/top-bar";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    // Placeholder for API call
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/customers");
    }, 500);
  }

  return (
    <>
      <TopBar title="New Customer" subtitle="Add a new customer" />

      <div style={{ flex: 1, padding: "24px", maxWidth: "640px" }}>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              Customer Details
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <FormField label="Name" name="name" placeholder="Full name" required />
              <FormField label="Email" name="email" type="email" placeholder="email@example.com" required />
              <FormField label="Phone" name="phone" placeholder="Phone number" />
              <FormField label="Company" name="company" placeholder="Company name" />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Additional notes..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 20px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creating..." : "Create Customer"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/customers")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
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
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "6px",
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

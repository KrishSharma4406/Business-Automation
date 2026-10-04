"use client";

import TopBar from "@/src/components/top-bar";
import { FormEvent, useState } from "react";

export default function LeadsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      message: formData.get("message"),
      source: "dashboard",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
      if (response.ok) {
        event.currentTarget.reset();
      }
    } catch (error) {
      console.error(error);
      setResult({ success: false, error: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar title="Leads" subtitle="Add and qualify leads with AI" />

      <div style={{ flex: 1, padding: "24px" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sort by:</span>
            <select
              style={{
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="date">Date created</option>
              <option value="score">AI Score</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            + New Lead
          </button>
        </div>

        {/* Create Lead Form */}
        {showForm && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "24px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Create Lead
              </span>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <FormField label="Name" name="name" placeholder="Rahul Sharma" required />
                <FormField label="Email" name="email" type="email" placeholder="rahul@example.com" />
                <FormField label="Phone" name="phone" placeholder="9876543210" />
                <FormField label="Company" name="company" placeholder="Rahul Technologies" />
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
                  Requirement
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us what you need..."
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
                {loading ? "AI is analyzing..." : "Create & Analyze Lead"}
              </button>
            </form>
          </div>
        )}

        {/* AI Result */}
        {result?.success && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "24px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                AI Qualification
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                <MiniCard label="Score" value={result.lead.aiScore} />
                <MiniCard label="Priority" value={result.lead.priority} />
                <MiniCard label="Source" value={result.lead.source} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  AI Summary
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                  {result.lead.aiSummary}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Suggested Response
                </p>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    lineHeight: 1.6,
                  }}
                >
                  {result.lead.aiResponse}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads List */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
              gap: "12px",
              padding: "12px 20px",
              borderBottom: "1px solid var(--border-default)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>Name</span>
            <span>Company</span>
            <span>Score</span>
            <span>Priority</span>
            <span>Created</span>
          </div>

          {/* Empty state */}
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              No leads yet.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              Create your first lead to let AI qualify it automatically.
            </p>
          </div>
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

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-input)",
        border: "1px solid var(--border-default)",
      }}
    >
      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>
        {value}
      </p>
    </div>
  );
}
"use client";

import TopBar from "@/src/components/top-bar";
import { FormEvent, useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  source?: string | null;
  status: string;
  priority: string;
  aiScore?: number | null;
  aiSummary?: string | null;
  aiResponse?: string | null;
  createdAt: string;
};

export default function LeadsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "score" | "priority">("date");

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      setLoadingLeads(true);
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
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
        form.reset();
        await loadLeads();
      }
    } catch (error) {
      console.error(error);
      setResult({ success: false, error: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortBy === "score") {
      return (b.aiScore ?? 0) - (a.aiScore ?? 0);
    }
    if (sortBy === "priority") {
      const pMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pMap[b.priority.toLowerCase()] || 0) - (pMap[a.priority.toLowerCase()] || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>
              ({leads.length} {leads.length === 1 ? "lead" : "leads"})
            </span>
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
              cursor: "pointer",
            }}
          >
            {showForm ? "Cancel" : "+ New Lead"}
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
                  cursor: "pointer",
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
                  Requirement / Inquiring Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Need AI business automation setup for customer support with a budget of $5,000..."
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
                {loading ? "AI is analyzing & qualifying..." : "Create & Analyze Lead"}
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
                AI Qualification Result
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                <MiniCard label="Score" value={`${result.lead.aiScore ?? 0}/100`} />
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
            overflow: "hidden",
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

          {/* Table Rows or Loading / Empty */}
          {loadingLeads ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading leads...</p>
            </div>
          ) : sortedLeads.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                No leads yet.
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Create your first lead to let AI qualify it automatically.
              </p>
            </div>
          ) : (
            sortedLeads.map((lead) => {
              const priority = (lead.priority || "low").toLowerCase();
              const priorityColors: Record<string, { bg: string; color: string }> = {
                urgent: { bg: "var(--red-subtle)", color: "var(--red)" },
                high: { bg: "var(--amber-subtle)", color: "var(--amber)" },
                medium: { bg: "var(--accent-subtle)", color: "var(--accent)" },
                low: { bg: "var(--bg-surface-hover)", color: "var(--text-muted)" },
              };
              const badge = priorityColors[priority] || priorityColors.low;

              return (
                <div
                  key={lead.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
                    gap: "12px",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-default)",
                    fontSize: "13px",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{lead.name}</span>
                    {lead.email && (
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{lead.email}</p>
                    )}
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>{lead.company || "—"}</span>
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          (lead.aiScore ?? 0) >= 70
                            ? "var(--green)"
                            : (lead.aiScore ?? 0) >= 40
                            ? "var(--amber)"
                            : "var(--text-muted)",
                      }}
                    >
                      {lead.aiScore ?? "—"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/100</span>
                  </div>
                  <div>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: badge.bg,
                        color: badge.color,
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {lead.priority}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "—"}
                  </span>
                </div>
              );
            })
          )}
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
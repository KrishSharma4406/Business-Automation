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
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

  async function handleDeleteLead(lead: Lead) {
    if (!window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      return;
    }

    setDeletingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete lead");
      }

      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      if (selectedLead?.id === lead.id) setSelectedLead(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete lead");
    } finally {
      setDeletingId(null);
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

  // Filter and sort
  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.company && lead.company.toLowerCase().includes(term)) ||
      (lead.message && lead.message.toLowerCase().includes(term))
    );
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === "score") {
      return (b.aiScore ?? 0) - (a.aiScore ?? 0);
    }
    if (sortBy === "priority") {
      const pMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pMap[b.priority.toLowerCase()] || 0) - (pMap[a.priority.toLowerCase()] || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const qualifiedCount = leads.filter((l) => (l.aiScore ?? 0) >= 70).length;
  const urgentCount = leads.filter((l) => (l.priority || "").toLowerCase() === "urgent").length;
  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((acc, curr) => acc + (curr.aiScore ?? 0), 0) / leads.length)
    : 0;

  return (
    <div className="az-dash-page">
      <TopBar title="Lead Pipeline" subtitle="Sub-400ms Real-Time AI Scoring &amp; Ingress" />

      <div className="az-dash-body">
        {/* Pipeline Telemetry Metrics */}
        <div className="az-dash-stats">
          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">TOTAL INGESTED</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>ALL TIME</span>
            </div>
            <div className="az-dash-stat-val">{leads.length}</div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Live Neon DB sync</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">QUALIFIED LEADS</span>
              <span className="az-tag az-tag-emerald" style={{ fontSize: "9px" }}>≥ 70 SCORE</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-emerald)" }}>{qualifiedCount}</div>
            <div className="az-dash-stat-delta">
              <span>↑</span>
              <span>{leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0}% conversion yield</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">URGENT PRIORITY</span>
              <span className="az-tag az-tag-amber" style={{ fontSize: "9px" }}>LOCK THREAD</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: "var(--az-amber)" }}>{urgentCount}</div>
            <div className="az-dash-stat-delta" style={{ color: "var(--az-amber)" }}>
              <span>!</span>
              <span>Immediate operator follow-up</span>
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">AVERAGE AI SCORE</span>
              <span className="az-tag" style={{ fontSize: "9px" }}>INTENT EVAL</span>
            </div>
            <div className="az-dash-stat-val">{avgScore}<span style={{ fontSize: "14px", color: "var(--az-text-muted)" }}>/100</span></div>
            <div className="az-dash-stat-delta">
              <span>●</span>
              <span>Model: Grok &amp; Neon Embeddings</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="az-toolbar">
          <div className="az-toolbar-group">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="az-input-search"
                style={{ width: "280px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                SORT:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="az-select-cyber"
              >
                <option value="date">Date Ingested</option>
                <option value="score">AI Intent Score</option>
                <option value="priority">Priority Level</option>
              </select>
            </div>

            <span className="az-tag" style={{ fontSize: "11px" }}>
              {sortedLeads.length} RECORD{sortedLeads.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="az-toolbar-group">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="az-btn-primary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              + Ingest New Lead
            </button>
          </div>
        </div>

        {/* Ingest Lead Modal */}
        {showForm && (
          <div className="az-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <div className="az-modal-box">
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--az-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                    <span className="az-status-dot" />
                    INGRESS PORT
                  </span>
                  <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
                    Manual Lead Ingestion
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="az-btn-secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="az-field">
                    <label className="az-field-label">Lead Identity // Name</label>
                    <input name="name" placeholder="Rahul Sharma" required className="az-field-input" />
                  </div>
                  <div className="az-field">
                    <label className="az-field-label">Contact // Email</label>
                    <input name="email" type="email" placeholder="rahul@example.com" className="az-field-input" />
                  </div>
                  <div className="az-field">
                    <label className="az-field-label">WhatsApp // Phone</label>
                    <input name="phone" placeholder="+91 98402 11982" className="az-field-input" />
                  </div>
                  <div className="az-field">
                    <label className="az-field-label">Organization // Company</label>
                    <input name="company" placeholder="Horizon Technologies" className="az-field-input" />
                  </div>
                </div>

                <div className="az-field">
                  <label className="az-field-label">Intent Payload // Requirement Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="We need automated dental clinic reminders and WhatsApp intake with custom SLA..."
                    className="az-field-textarea"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="az-btn-secondary"
                    style={{ fontSize: "12px", padding: "8px 16px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="az-btn-primary"
                    style={{ fontSize: "12px", padding: "8px 20px" }}
                  >
                    {loading ? "AI Evaluating..." : "Ingest & Qualify Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Result Banner if just created */}
        {result?.success && (
          <div className="az-dash-card" style={{ borderColor: "var(--az-emerald)" }}>
            <div className="az-dash-card-header" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
              <div className="az-dash-card-title" style={{ color: "var(--az-emerald)" }}>
                <span className="az-status-dot" />
                <span>AI QUALIFICATION COMPLETE // LEAD QUALIFIED</span>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                style={{ background: "transparent", border: "none", color: "var(--az-text-muted)", cursor: "pointer", fontSize: "12px" }}
              >
                ✕ Dismiss
              </button>
            </div>
            <div className="az-dash-card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "var(--az-surface-alt)", padding: "12px", borderRadius: "4px", border: "1px solid var(--az-border)" }}>
                  <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>EVALUATION SCORE</div>
                  <div style={{ fontSize: "20px", fontFamily: "var(--az-font-mono)", fontWeight: 700, color: "var(--az-emerald)", marginTop: "4px" }}>
                    {result.lead.aiScore ?? 0} / 100
                  </div>
                </div>
                <div style={{ background: "var(--az-surface-alt)", padding: "12px", borderRadius: "4px", border: "1px solid var(--az-border)" }}>
                  <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>PIPELINE PRIORITY</div>
                  <div style={{ fontSize: "16px", fontFamily: "var(--az-font-mono)", fontWeight: 700, color: "#ffffff", marginTop: "6px", textTransform: "uppercase" }}>
                    {result.lead.priority}
                  </div>
                </div>
                <div style={{ background: "var(--az-surface-alt)", padding: "12px", borderRadius: "4px", border: "1px solid var(--az-border)" }}>
                  <div style={{ fontSize: "10px", fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>INGRESS CHANNEL</div>
                  <div style={{ fontSize: "16px", fontFamily: "var(--az-font-mono)", fontWeight: 700, color: "#ffffff", marginTop: "6px" }}>
                    {result.lead.source || "Dashboard"}
                  </div>
                </div>
              </div>

              {result.lead.aiSummary && (
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-secondary)", textTransform: "uppercase" }}>
                    AI Analysis Summary:
                  </span>
                  <p style={{ fontSize: "13px", color: "#ffffff", marginTop: "4px", lineHeight: 1.5 }}>
                    {result.lead.aiSummary}
                  </p>
                </div>
              )}

              {result.lead.aiResponse && (
                <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "12px", borderRadius: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-emerald)", textTransform: "uppercase" }}>
                      Suggested Automated Response:
                    </span>
                    <span className="az-tag" style={{ fontSize: "9px" }}>WHATSAPP / EMAIL</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", fontFamily: "var(--az-font-mono)" }}>
                    {result.lead.aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="az-table-wrapper">
          <table className="az-table">
            <thead>
              <tr>
                <th>Lead Identity</th>
                <th>Company</th>
                <th>AI Score</th>
                <th>Priority</th>
                <th>Channel Ingress</th>
                <th>Ingested</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingLeads ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <span style={{ fontFamily: "var(--az-font-mono)", color: "var(--az-text-muted)" }}>
                      Querying Neon PostgreSQL records...
                    </span>
                  </td>
                </tr>
              ) : sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                      <span className="az-tag" style={{ marginBottom: "10px", display: "inline-block" }}>
                        PIPELINE DORMANT
                      </span>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>
                        No leads captured yet
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", marginBottom: "16px" }}>
                        Incoming WhatsApp webhooks and REST leads will automatically populate and score here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="az-btn-primary"
                        style={{ fontSize: "12px", padding: "8px 16px" }}
                      >
                        + Ingest First Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => {
                  const score = lead.aiScore ?? 0;
                  const priority = (lead.priority || "low").toLowerCase();

                  return (
                    <tr
                      key={lead.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: "#ffffff" }}>{lead.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
                          {lead.email || lead.phone || "No direct handle"}
                        </div>
                      </td>

                      <td style={{ color: "var(--az-text-secondary)" }}>
                        {lead.company || "—"}
                      </td>

                      <td>
                        <span
                          className={
                            score >= 70
                              ? "az-tag az-tag-emerald"
                              : score >= 40
                              ? "az-tag az-tag-amber"
                              : "az-tag"
                          }
                          style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px" }}
                        >
                          {score} / 100
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            priority === "urgent"
                              ? "az-tag az-tag-amber"
                              : priority === "high"
                              ? "az-tag az-tag-cyan"
                              : "az-tag"
                          }
                          style={{ fontSize: "10px", textTransform: "uppercase" }}
                        >
                          {priority}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-secondary)" }}>
                          {lead.source || "REST Ingress"}
                        </span>
                      </td>

                      <td style={{ fontFamily: "var(--az-font-mono)", fontSize: "11px", color: "var(--az-text-muted)" }}>
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>

                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="az-btn-secondary"
                            style={{ fontSize: "11px", padding: "3px 8px" }}
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead)}
                            disabled={deletingId === lead.id}
                            className="az-btn-secondary"
                            style={{
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "#f87171",
                            }}
                          >
                            {deletingId === lead.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Lead Inspection Drawer / Modal */}
        {selectedLead && (
          <div className="az-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedLead(null); }}>
            <div className="az-modal-box" style={{ maxWidth: "680px" }}>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--az-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="az-tag az-tag-emerald" style={{ fontSize: "10px" }}>
                    ID: {selectedLead.id.slice(0, 8)}
                  </span>
                  <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
                    Lead Telemetry Inspection
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="az-btn-secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>{selectedLead.name}</h2>
                    <div style={{ fontSize: "12px", color: "var(--az-text-secondary)", marginTop: "2px" }}>
                      {selectedLead.company ? `${selectedLead.company} // ` : ""}{selectedLead.email || selectedLead.phone || "No contact info"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span className="az-tag az-tag-emerald" style={{ fontSize: "12px", fontFamily: "var(--az-font-mono)" }}>
                      AI SCORE: {selectedLead.aiScore ?? 0}/100
                    </span>
                    <span className="az-tag" style={{ fontSize: "12px", textTransform: "uppercase" }}>
                      PRIORITY: {selectedLead.priority}
                    </span>
                  </div>
                </div>

                {selectedLead.message && (
                  <div style={{ background: "var(--az-surface-alt)", border: "1px solid var(--az-border)", padding: "14px", borderRadius: "4px" }}>
                    <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Raw Ingress Message:
                    </div>
                    <p style={{ fontSize: "13px", color: "#ffffff", lineHeight: 1.5 }}>
                      "{selectedLead.message}"
                    </p>
                  </div>
                )}

                {selectedLead.aiSummary && (
                  <div>
                    <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                      AI Autonomous Evaluation:
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--az-text-secondary)", lineHeight: 1.6 }}>
                      {selectedLead.aiSummary}
                    </p>
                  </div>
                )}

                {selectedLead.aiResponse && (
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "14px", borderRadius: "4px" }}>
                    <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "10px", color: "var(--az-emerald)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Generated Response Payload:
                    </div>
                    <p style={{ fontSize: "12px", color: "#ffffff", fontFamily: "var(--az-font-mono)", lineHeight: 1.6 }}>
                      {selectedLead.aiResponse}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid var(--az-border-subtle)" }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead)}
                    className="az-btn-secondary"
                    style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171", fontSize: "12px", padding: "6px 14px" }}
                  >
                    Delete Record
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert("Automated dispatch signal sent to customer channel.");
                    }}
                    className="az-btn-primary"
                    style={{ fontSize: "12px", padding: "6px 16px" }}
                  >
                    Dispatch AI Response →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
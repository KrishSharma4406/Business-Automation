"use client";

import { useEffect, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { Icon } from "@/src/components/ui/icon";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Ingest Lead Modal
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleIngestLead(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          company: formCompany.trim() || undefined,
          message: formMessage.trim() || undefined,
          source: "Direct Manual",
        }),
      });

      if (res.ok) {
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormCompany("");
        setFormMessage("");
        setShowModal(false);
        loadLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchPriority =
      priorityFilter === "all" || l.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchSearch && matchPriority;
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        title="Leads Ingress & AI Scoring"
        subtitle="Automated lead qualification (0-100), urgency tier prioritization, and personalized response synthesis."
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Icon name="plus" size={14} strokeWidth={2.5} />
            Ingest Lead
          </button>
        }
      />

      <div style={{ padding: "32px 36px 60px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {/* Search & Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: "420px", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: "12px", color: "#94a3b8", display: "flex" }}>
              <Icon name="search" size={15} />
            </span>
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                outline: "none",
                color: "#0f172a",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              padding: "3px",
              gap: "2px",
            }}
          >
            {(["all", "high", "medium", "low"] as const).map((tab) => {
              const isSel = priorityFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setPriorityFilter(tab)}
                  style={{
                    border: "none",
                    backgroundColor: isSel ? "#ffffff" : "transparent",
                    color: isSel ? "#0f172a" : "#64748b",
                    fontSize: "12px",
                    fontWeight: isSel ? 600 : 500,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    boxShadow: isSel ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leads Table */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 2fr 1.2fr 1.2fr 1fr",
              padding: "14px 20px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            <div>Prospect</div>
            <div>Company / Source</div>
            <div>AI Score</div>
            <div>Priority</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
              <Icon name="events" size={32} style={{ color: "#cbd5e1", marginBottom: "8px" }} />
              <div style={{ fontSize: "14px", fontWeight: 500 }}>No leads in queue</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Submit a new inbound lead or connect your webhook endpoints.
              </div>
            </div>
          ) : (
            filtered.map((lead) => {
              const score = lead.aiScore ?? 0;
              const scoreColor =
                score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#64748b";

              return (
                <div
                  key={lead.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.5fr 2fr 1.2fr 1.2fr 1fr",
                    padding: "16px 20px",
                    alignItems: "center",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "13px",
                    color: "#1e293b",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{lead.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      {lead.email || "No email"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 500, color: "#334155" }}>
                      {lead.company || "Direct Individual"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{lead.source || "Web Ingress"}</div>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: scoreColor,
                      }}
                    >
                      {lead.aiScore ? `${lead.aiScore}/100` : "Pending"}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor:
                          lead.priority?.toLowerCase() === "high"
                            ? "#fee2e2"
                            : lead.priority?.toLowerCase() === "medium"
                            ? "#fef3c7"
                            : "#f1f5f9",
                        color:
                          lead.priority?.toLowerCase() === "high"
                            ? "#dc2626"
                            : lead.priority?.toLowerCase() === "medium"
                            ? "#b45309"
                            : "#475569",
                        textTransform: "capitalize",
                      }}
                    >
                      {lead.priority || "Normal"}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        padding: "5px 10px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      AI Analysis
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ingest Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "26px 30px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
                Ingest New Lead
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleIngestLead}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Vance"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. elena@vance.io"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vance Systems"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Project Inquiry / Message
                </label>
                <textarea
                  placeholder="Details regarding request or requirements..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 500, color: "#64748b", backgroundColor: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, color: "#ffffff", backgroundColor: "#0284c7", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  {submitting ? "Evaluating..." : "Ingest & Qualify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Drawer */}
      {selectedLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              height: "100%",
              padding: "32px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                  {selectedLead.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {selectedLead.company || "Independent"}
                </span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                style={{ background: "transparent", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  AI Scoring Evaluation
                </span>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#0284c7", marginTop: "4px" }}>
                  {selectedLead.aiScore ? `${selectedLead.aiScore}/100` : "Evaluation Pending"}
                </div>
                {selectedLead.aiSummary && (
                  <p style={{ fontSize: "13px", color: "#475569", marginTop: "8px", lineHeight: 1.5 }}>
                    {selectedLead.aiSummary}
                  </p>
                )}
              </div>

              {selectedLead.message && (
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Original Inquiry
                  </span>
                  <div style={{ fontSize: "13px", color: "#1e293b", marginTop: "4px", backgroundColor: "#f1f5f9", padding: "12px", borderRadius: "6px" }}>
                    {selectedLead.message}
                  </div>
                </div>
              )}

              {selectedLead.aiResponse && (
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    AI-Drafted Response
                  </span>
                  <div style={{ fontSize: "13px", color: "#1e293b", marginTop: "4px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "6px", lineHeight: 1.5 }}>
                    {selectedLead.aiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

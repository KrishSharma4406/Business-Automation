"use client";

import { useEffect, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { Icon } from "@/src/components/ui/icon";

type Automation = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  description?: string | null;
  createdAt: string;
};

const TRIGGER_LABELS: Record<string, string> = {
  new_lead: "When a new lead arrives",
  new_customer: "When a new customer is added",
  lead_qualified: "When a lead is qualified with high score",
  stalled_deal: "When a lead is dormant for 48 hours",
};

const ACTION_LABELS: Record<string, string> = {
  ai_qualify_lead: "Qualify lead with AI model",
  send_email: "Send transactional email via Resend",
  send_whatsapp: "Dispatch message via WhatsApp Cloud API",
  notify_owner: "Send alert to workspace owner",
  create_task: "Log follow-up task to CRM",
};

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Automation Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("new_lead");
  const [action, setAction] = useState("ai_qualify_lead");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAutomations();
  }, []);

  async function loadAutomations() {
    try {
      setLoading(true);
      const res = await fetch("/api/automations");
      if (res.ok) {
        const data = await res.json();
        setAutomations(data.automations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentState }),
      });
      if (res.ok) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, enabled: !currentState } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          trigger,
          action,
          enabled: true,
        }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setShowModal(false);
        loadAutomations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

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
        title="Deterministic Automations"
        subtitle="Configure event-driven workflows connecting triggers to autonomous actions."
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
            Create Automation
          </button>
        }
      />

      <div style={{ padding: "32px 36px 60px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {/* Metric Overview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              Total Rules
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>
              {automations.length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              Active Rules
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a", marginTop: "8px" }}>
              {automations.filter((a) => a.enabled).length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              Paused Rules
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#d97706", marginTop: "8px" }}>
              {automations.filter((a) => !a.enabled).length}
            </div>
          </div>
        </div>

        {/* Automations List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {automations.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "48px 24px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <Icon name="automation" size={32} style={{ color: "#cbd5e1", marginBottom: "8px" }} />
              <div style={{ fontSize: "14px", fontWeight: 500 }}>No automations active</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Create your first event-driven workflow rule to automate actions.
              </div>
            </div>
          ) : (
            automations.map((a) => (
              <div
                key={a.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                      {a.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor: a.enabled ? "#f0fdf4" : "#f1f5f9",
                        color: a.enabled ? "#16a34a" : "#64748b",
                      }}
                    >
                      {a.enabled ? "Active" : "Paused"}
                    </span>
                  </div>

                  {a.description && (
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                      {a.description}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#eff6ff",
                        color: "#0284c7",
                      }}
                    >
                      Trigger: {TRIGGER_LABELS[a.trigger] || a.trigger}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>&rarr;</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#fdf4ff",
                        color: "#c026d3",
                      }}
                    >
                      Action: {ACTION_LABELS[a.action] || a.action}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => handleToggle(a.id, a.enabled)}
                    style={{
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: a.enabled ? "#fef2f2" : "#f0fdf4",
                      color: a.enabled ? "#dc2626" : "#16a34a",
                      border: `1px solid ${a.enabled ? "#fecaca" : "#bbf7d0"}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    {a.enabled ? "Pause Rule" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
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
                Create Automation Rule
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAutomation}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Rule Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Instant Lead Qualification"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Triggers evaluation upon incoming contact form"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Trigger Event
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: "#ffffff" }}
                >
                  <option value="new_lead">When a new lead arrives</option>
                  <option value="lead_qualified">When a lead is qualified with high score</option>
                  <option value="new_customer">When a new customer is added</option>
                  <option value="stalled_deal">When a lead is dormant for 48 hours</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
                  Dispatched Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: "#ffffff" }}
                >
                  <option value="ai_qualify_lead">Qualify lead with AI model</option>
                  <option value="send_email">Send transactional email via Resend</option>
                  <option value="send_whatsapp">Dispatch message via WhatsApp Cloud API</option>
                  <option value="notify_owner">Send alert to workspace owner</option>
                  <option value="create_task">Log follow-up task to CRM</option>
                </select>
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
                  {submitting ? "Saving..." : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

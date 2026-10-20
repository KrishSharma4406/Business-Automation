"use client";

import { useState } from "react";

type CreateAutomationFormProps = {
  onClose: () => void;
  onCreated: () => void;
};

const triggers = [
  { value: "new_lead", label: "When a new lead arrives (WhatsApp / Web)" },
  { value: "new_customer", label: "When a new customer is created" },
  { value: "new_message", label: "When an inbound message arrives" },
  { value: "lead_qualified", label: "When a lead is qualified (AI Score ≥ 80)" },
  { value: "conversation_received", label: "When a conversation thread starts" },
];

const actions = [
  { value: "ai_qualify_lead", label: "AI: Qualify lead intent & scoring" },
  { value: "generate_response", label: "AI: Generate contextual response" },
  { value: "send_whatsapp", label: "Dispatch: Send WhatsApp template" },
  { value: "send_email", label: "Dispatch: Send SMTP email notification" },
  { value: "notify_owner", label: "Alert: Notify workspace operator" },
  { value: "create_task", label: "Pipeline: Create Neon CRM task" },
];

export default function CreateAutomationForm({
  onClose,
  onCreated,
}: CreateAutomationFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("new_lead");
  const [action, setAction] = useState("ai_qualify_lead");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          trigger,
          action,
          enabled,
          config: {},
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create automation rule");
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="az-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
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
              RULE BLUEPRINT
            </span>
            <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
              Deploy Autonomous Rule
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="az-btn-secondary"
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            ✕ Close
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div className="az-auth-error">
              [RULE_ERROR] {error}
            </div>
          )}

          <div className="az-field">
            <label className="az-field-label">Rule Name // Blueprint Identifier</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instant WhatsApp Intake & Booking"
              className="az-field-input"
            />
          </div>

          <div className="az-field">
            <label className="az-field-label">Trigger Condition // Event Ingress</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="az-field-select"
            >
              {triggers.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="az-field">
            <label className="az-field-label">Autonomous Action // Execution Node</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="az-field-select"
            >
              {actions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="az-field">
            <label className="az-field-label">Operational Synopsis // Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Evaluates commercial intent upon receiving message and sends scheduling link."
              className="az-field-textarea"
            />
          </div>

          <div
            style={{
              padding: "12px",
              background: "var(--az-surface-alt)",
              border: "1px solid var(--az-border)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--az-font-mono)", fontSize: "12px", color: "#ffffff", fontWeight: 600 }}>
                Initial State
              </div>
              <div style={{ fontSize: "11px", color: "var(--az-text-secondary)" }}>
                Start this automation immediately upon provisioning
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                style={{ accentColor: "var(--az-emerald)", width: "16px", height: "16px" }}
              />
              <span className={enabled ? "az-tag az-tag-emerald" : "az-tag"} style={{ fontSize: "10px" }}>
                {enabled ? "ACTIVE" : "PAUSED"}
              </span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="az-btn-secondary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="az-btn-primary"
              style={{ fontSize: "12px", padding: "8px 22px" }}
            >
              {loading ? "Deploying Blueprint..." : "Deploy Automation Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

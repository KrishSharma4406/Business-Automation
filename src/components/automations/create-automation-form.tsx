"use client";

import { useState } from "react";

type CreateAutomationFormProps = {
  onClose: () => void;
  onCreated: () => void;
};

const triggers = [
  { value: "new_lead", label: "When a new lead arrives (WhatsApp or Web)" },
  { value: "new_customer", label: "When a new customer is added" },
  { value: "new_message", label: "When a new message arrives" },
  { value: "lead_qualified", label: "When a lead is qualified (AI Score ≥ 80)" },
  { value: "conversation_received", label: "When a new chat conversation starts" },
];

const actions = [
  { value: "ai_qualify_lead", label: "AI: Qualify & score lead intent" },
  { value: "generate_response", label: "AI: Generate smart reply" },
  { value: "send_whatsapp", label: "Send WhatsApp message" },
  { value: "send_email", label: "Send email notification" },
  { value: "notify_owner", label: "Send alert to business owner" },
  { value: "create_task", label: "Create a follow-up task" },
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
              NEW AUTOMATION
            </span>
            <h3 style={{ fontFamily: "var(--az-font-mono)", fontSize: "13px", color: "#ffffff", textTransform: "uppercase" }}>
              Create New Automation
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
              {error}
            </div>
          )}

          <div className="az-field">
            <label className="az-field-label">Automation Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instant WhatsApp Reply & Scoring"
              className="az-field-input"
            />
          </div>

          <div className="az-field">
            <label className="az-field-label">When this happens (Trigger)</label>
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
            <label className="az-field-label">Take this action (Action)</label>
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
            <label className="az-field-label">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this automation does for your business..."
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
                Status
              </div>
              <div style={{ fontSize: "11px", color: "var(--az-text-secondary)" }}>
                Enable this automation immediately upon saving
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
              {loading ? "Creating..." : "Create Automation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";

type CreateAutomationFormProps = {
  onClose: () => void;
  onCreated: () => void;
};

const triggers = [
  { value: "new_lead", label: "When a new lead arrives" },
  { value: "new_customer", label: "When a new customer is created" },
  { value: "new_message", label: "When a new message arrives" },
  { value: "lead_qualified", label: "When a lead is qualified" },
  {
    value: "conversation_received",
    label: "When a conversation is received",
  },
];

const actions = [
  { value: "ai_qualify_lead", label: "Qualify lead with AI" },
  { value: "generate_response", label: "Generate an AI response" },
  { value: "send_email", label: "Send email" },
  { value: "send_whatsapp", label: "Send WhatsApp message" },
  { value: "notify_owner", label: "Notify business owner" },
  { value: "create_task", label: "Create a task" },
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
        throw new Error(result.error || "Failed to create automation");
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-secondary)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "19px", fontWeight: 700 }}>
              Create Automation
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "5px",
              }}
            >
              Configure a business workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close form"
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Automation name *</label>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. AI Lead Qualification"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this automation should do"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Trigger *</label>
          <select
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            style={inputStyle}
          >
            {triggers.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Action *</label>
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            style={inputStyle}
          >
            {actions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "20px",
          }}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Enable this automation immediately
        </label>

        {error && (
          <p
            role="alert"
            style={{
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Automation"}
          </button>
        </div>
      </form>
    </div>
  );
}

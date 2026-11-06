"use client";

import { useEffect, useState } from "react";
import TopBar from "@/src/components/top-bar";
import { Icon } from "@/src/components/ui/icon";

type Integration = {
  id: string;
  provider: string;
  name: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  hasCredentials: boolean;
};

const PROVIDERS = [
  {
    provider: "WHATSAPP",
    name: "WhatsApp Cloud API",
    description: "Receive client inquiries and send automated responses via official Meta API.",
    icon: "chat",
  },
  {
    provider: "GMAIL",
    name: "Gmail / SMTP",
    description: "Send automated transactional emails, scheduling confirmations, and follow-ups.",
    icon: "mail",
  },
  {
    provider: "SLACK",
    name: "Slack Webhooks",
    description: "Dispatch instant notifications and high-priority lead alerts to internal channels.",
    icon: "award",
  },
  {
    provider: "STRIPE",
    name: "Stripe Billing",
    description: "Monitor customer subscription invoices and automatic contract activations.",
    icon: "vote",
  },
  {
    provider: "GOOGLE",
    name: "Google Calendar",
    description: "Synchronize consultation bookings and prevent double-booking across team calendars.",
    icon: "calendar",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDERS)[number] | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/integrations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.integrations) setIntegrations(data.integrations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setSaving(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider.provider,
          name: selectedProvider.name,
          credentials: { apiKey: apiKeyInput.trim() },
        }),
      });

      if (res.ok) {
        setSelectedProvider(null);
        setApiKeyInput("");
        const refreshed = await fetch("/api/integrations").then((r) => r.json());
        if (refreshed?.integrations) setIntegrations(refreshed.integrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
        title="Integration Gateways"
        subtitle="Manage secure API credentials and connected omnichannel notification channels."
      />

      <div style={{ padding: "32px 36px 60px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {PROVIDERS.map((p) => {
            const connected = integrations.some(
              (i) => i.provider === p.provider && i.status === "CONNECTED"
            );

            return (
              <div
                key={p.provider}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: connected ? "#f0fdf4" : "#f1f5f9",
                        color: connected ? "#16a34a" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name={p.icon} size={18} />
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor: connected ? "#f0fdf4" : "#f8fafc",
                        color: connected ? "#16a34a" : "#94a3b8",
                        border: `1px solid ${connected ? "#bbf7d0" : "#e2e8f0"}`,
                      }}
                    >
                      {connected ? "Connected" : "Not Linked"}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "16px 0 4px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    onClick={() => setSelectedProvider(p)}
                    style={{
                      width: "100%",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 500,
                      backgroundColor: connected ? "#f8fafc" : "#0284c7",
                      color: connected ? "#334155" : "#ffffff",
                      border: connected ? "1px solid #cbd5e1" : "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {connected ? "Configure Keys" : "Connect Provider"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      {selectedProvider && (
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
              maxWidth: "440px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
                Connect {selectedProvider.name}
              </h3>
              <button
                onClick={() => setSelectedProvider(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConnect}>
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  API Token / Secret Key
                </label>
                <input
                  type="password"
                  placeholder="Paste authorization credentials..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  required
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
                <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Encrypted with AES-256 in your isolated database record.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 500, color: "#64748b", backgroundColor: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, color: "#ffffff", backgroundColor: "#0284c7", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  {saving ? "Saving..." : "Save Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

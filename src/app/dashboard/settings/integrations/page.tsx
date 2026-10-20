"use client";

import TopBar from "@/src/components/top-bar";
import ConnectModal from "@/src/components/integrations/connect-modal";
import { useEffect, useState } from "react";
import Link from "next/link";

type Integration = {
  id: string;
  provider: string;
  name: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  metadata?: Record<string, unknown>;
  hasCredentials: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const providers = [
  { provider: "WHATSAPP", name: "WhatsApp Cloud API", description: "Send automated messages and lead updates directly to customers", color: "#25d366" },
  { provider: "GROK", name: "Grok / xAI", description: "Power high-speed AI conversations and lead triage reasoning", color: "#6366f1" },
  { provider: "GMAIL", name: "Gmail Automation", description: "Send outbound email follow-ups and notifications to prospects", color: "#ea4335" },
  { provider: "SLACK", name: "Slack Alerts", description: "Post real-time notifications to your internal team channels", color: "#e01e5a" },
  { provider: "GOOGLE", name: "Google Calendar", description: "Schedule client appointments and sync demo bookings", color: "#4285f4" },
  { provider: "STRIPE", name: "Stripe Billing", description: "Track invoices, payments, and client subscription statuses", color: "#635bff" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectProvider, setConnectProvider] = useState<(typeof providers)[number] | null>(null);
  const [editIntegration, setEditIntegration] = useState<Integration | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/integrations");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load integrations");
      setIntegrations(data.integrations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3500);
  }

  function getIntegration(provider: string) {
    return integrations.find((i) => i.provider === provider);
  }

  async function handleDisconnect(integration: Integration) {
    const confirmed = window.confirm(
      `Disconnect ${integration.name}? The service will be disabled until you reconnect.`
    );
    if (!confirmed) return;
    try {
      setActionLoading(integration.id);
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISCONNECTED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to disconnect");
      showSuccess(`${integration.name} disconnected`);
      await loadIntegrations();
    } catch (err: any) {
      alert(err.message || "Failed to disconnect");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReconnect(integration: Integration) {
    setEditIntegration(integration);
    const providerInfo = providers.find((p) => p.provider === integration.provider);
    if (providerInfo) setConnectProvider(providerInfo);
  }

  async function handleDelete(integration: Integration) {
    const confirmed = window.confirm(
      `Remove ${integration.name} integration and delete saved credentials? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      setActionLoading(integration.id);
      const response = await fetch(`/api/integrations/${integration.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete");
      showSuccess(`${integration.name} removed`);
      await loadIntegrations();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const connectedCount = integrations.filter((i) => i.status === "CONNECTED").length;

  return (
    <div className="az-dash-page">
      <TopBar
        title="App Integrations"
        subtitle="Connect external services to automate messaging, AI, and workflow triggers"
      />

      <div className="az-dash-body">
        {/* Top bar with back link & stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Link
            href="/dashboard/settings"
            className="az-btn-secondary"
            style={{ fontSize: "11px", padding: "6px 12px", textDecoration: "none" }}
          >
            ← Back to Settings
          </Link>
          <span style={{ fontSize: "12px", color: "var(--az-text-muted)", fontFamily: "var(--az-font-mono)" }}>
            STATUS: <strong style={{ color: "#ffffff" }}>{connectedCount}</strong> OF {providers.length} CONNECTED
          </span>
        </div>

        {/* Stats Grid */}
        <div className="az-dash-stats">
          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">Available Apps</span>
              <span className="az-tag az-tag-blue">Catalog</span>
            </div>
            <div className="az-dash-stat-val">{providers.length}</div>
            <div className="az-dash-stat-delta" style={{ color: "var(--az-text-muted)" }}>Supported platforms</div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">Connected</span>
              <span className="az-tag az-tag-emerald">Active</span>
            </div>
            <div className="az-dash-stat-val" style={{ color: connectedCount > 0 ? "var(--az-emerald)" : "#ffffff" }}>
              {connectedCount}
            </div>
            <div className="az-dash-stat-delta">
              <span className="az-status-dot" /> Live &amp; transmitting
            </div>
          </div>

          <div className="az-dash-stat">
            <div className="az-dash-stat-top">
              <span className="az-dash-stat-label">Security &amp; Encryption</span>
              <span className="az-tag az-tag-emerald">AES-256</span>
            </div>
            <div className="az-dash-stat-val" style={{ fontSize: "20px" }}>Protected</div>
            <div className="az-dash-stat-delta">All tokens encrypted in storage</div>
          </div>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "4px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "var(--az-emerald)",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="az-status-dot" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "4px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--az-red)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* Grid of integrations */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "16px",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="az-dash-card"
                style={{ height: "200px", opacity: 0.5, animation: "pulse 1.5s infinite" }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "16px",
            }}
          >
            {providers.map((provider) => {
              const integration = getIntegration(provider.provider);
              const isConnected = integration?.status === "CONNECTED";
              const isDisconnected = integration?.status === "DISCONNECTED";
              const isError = integration?.status === "ERROR";
              const isLoading = actionLoading === integration?.id;

              return (
                <div
                  key={provider.provider}
                  className="az-dash-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderColor: isConnected
                      ? "rgba(16, 185, 129, 0.3)"
                      : isError
                      ? "rgba(239, 68, 68, 0.3)"
                      : "var(--az-border)",
                  }}
                >
                  {/* Header */}
                  <div className="az-dash-card-header">
                    <div className="az-dash-card-title">
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: isConnected ? "var(--az-emerald)" : isDisconnected ? "var(--az-amber)" : "#5a6578",
                          boxShadow: isConnected ? "0 0 8px rgba(16, 185, 129, 0.5)" : "none",
                        }}
                      />
                      <span>{provider.name}</span>
                    </div>

                    <span
                      className={`az-tag ${
                        isConnected
                          ? "az-tag-emerald"
                          : isError
                          ? "az-tag-red"
                          : isDisconnected
                          ? "az-tag-amber"
                          : "az-tag-blue"
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      {isConnected
                        ? "Connected"
                        : isError
                        ? "Attention"
                        : isDisconnected
                        ? "Paused"
                        : "Ready to Add"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="az-dash-card-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "var(--az-text-secondary)", lineHeight: 1.45, marginBottom: "14px" }}>
                        {provider.description}
                      </p>

                      {integration && (
                        <div
                          style={{
                            padding: "8px 12px",
                            borderRadius: "4px",
                            background: "rgba(22, 26, 32, 0.6)",
                            border: "1px solid var(--az-border)",
                            fontSize: "11px",
                            fontFamily: "var(--az-font-mono)",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "var(--az-text-muted)" }}>STATUS</span>
                          <span style={{ color: integration.hasCredentials ? "var(--az-emerald)" : "var(--az-red)" }}>
                            {integration.hasCredentials ? "Credentials Active" : "Missing Key"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid var(--az-border)" }}>
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleDisconnect(integration!)}
                            disabled={isLoading}
                            className="az-btn-secondary"
                            style={{ flex: 1, fontSize: "11px", padding: "6px 10px" }}
                          >
                            {isLoading ? "..." : "Pause"}
                          </button>
                          <button
                            onClick={() => handleDelete(integration!)}
                            disabled={isLoading}
                            className="az-btn-secondary"
                            style={{
                              fontSize: "11px",
                              padding: "6px 10px",
                              color: "var(--az-red)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            Remove
                          </button>
                        </>
                      ) : isDisconnected || isError ? (
                        <>
                          <button
                            onClick={() => handleReconnect(integration!)}
                            disabled={isLoading}
                            className="az-btn-primary"
                            style={{ flex: 1, fontSize: "11px", padding: "6px 10px" }}
                          >
                            {isLoading ? "..." : "Reconnect"}
                          </button>
                          <button
                            onClick={() => handleDelete(integration!)}
                            disabled={isLoading}
                            className="az-btn-secondary"
                            style={{
                              fontSize: "11px",
                              padding: "6px 10px",
                              color: "var(--az-red)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditIntegration(null);
                            setConnectProvider(provider);
                          }}
                          className="az-btn-primary"
                          style={{ width: "100%", fontSize: "11px", padding: "7px 12px" }}
                        >
                          + Connect Service
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {connectProvider && (
        <ConnectModal
          provider={connectProvider}
          integration={editIntegration ?? undefined}
          onClose={() => {
            setConnectProvider(null);
            setEditIntegration(null);
          }}
          onSuccess={() => {
            setConnectProvider(null);
            setEditIntegration(null);
            showSuccess(
              `${connectProvider.name} ${editIntegration ? "updated" : "connected"} successfully`
            );
            loadIntegrations();
          }}
        />
      )}
    </div>
  );
}
"use client";

import TopBar from "@/src/components/top-bar";
import ConnectModal from "@/src/components/integrations/connect-modal";
import { useEffect, useState } from "react";

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
  { provider: "GROK", name: "Grok", description: "AI and automation", color: "#6366f1" },
  { provider: "GOOGLE", name: "Google", description: "Google Workspace", color: "#4285f4" },
  { provider: "GMAIL", name: "Gmail", description: "Email automation", color: "#ea4335" },
  { provider: "SLACK", name: "Slack", description: "Team communication", color: "#e01e5a" },
  { provider: "WHATSAPP", name: "WhatsApp", description: "Customer communication", color: "#25d366" },
  { provider: "STRIPE", name: "Stripe", description: "Payments", color: "#635bff" },
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
      setIntegrations(data.integrations);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  function getIntegration(provider: string) {
    return integrations.find((i) => i.provider === provider);
  }

  async function handleDisconnect(integration: Integration) {
    const confirmed = window.confirm(
      `Disconnect ${integration.name}? The integration will be set to DISCONNECTED but not deleted.`
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
      alert(err.message || "Something went wrong");
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
      `Permanently delete the ${integration.name} integration? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      setActionLoading(integration.id);
      const response = await fetch(`/api/integrations/${integration.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete");
      showSuccess(`${integration.name} deleted`);
      await loadIntegrations();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
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
    <>
      <TopBar
        title="Integrations"
        subtitle={`${connectedCount} connected`}
      />

      <div style={{ flex: 1, padding: "24px" }}>
        {/* Success banner */}
        {successMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--green-subtle)",
              border: "1px solid rgba(46, 204, 113, 0.25)",
              color: "var(--green)",
              fontSize: "13px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--red-subtle)",
              border: "1px solid rgba(231, 76, 60, 0.25)",
              color: "var(--red)",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "180px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
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
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${
                      isConnected
                        ? "rgba(46, 204, 113, 0.25)"
                        : isError
                        ? "rgba(231, 76, 60, 0.25)"
                        : "var(--border-default)"
                    }`,
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    transition: "border-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-active)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isConnected
                      ? "rgba(46, 204, 113, 0.25)"
                      : isError
                      ? "rgba(231, 76, 60, 0.25)"
                      : "var(--border-default)";
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {provider.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {provider.description}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: isConnected
                          ? "var(--green-subtle)"
                          : isError
                          ? "var(--red-subtle)"
                          : isDisconnected
                          ? "var(--yellow-subtle)"
                          : "rgba(113, 113, 122, 0.12)",
                        color: isConnected
                          ? "var(--green)"
                          : isError
                          ? "var(--red)"
                          : isDisconnected
                          ? "var(--yellow)"
                          : "var(--text-muted)",
                        border: `1px solid ${
                          isConnected
                            ? "rgba(46, 204, 113, 0.2)"
                            : isError
                            ? "rgba(231, 76, 60, 0.2)"
                            : isDisconnected
                            ? "rgba(240, 180, 41, 0.2)"
                            : "rgba(113, 113, 122, 0.15)"
                        }`,
                      }}
                    >
                      {isConnected
                        ? "Connected"
                        : isError
                        ? "Error"
                        : isDisconnected
                        ? "Disconnected"
                        : "Available"}
                    </span>
                  </div>

                  {/* Metadata */}
                  {integration && (
                    <div
                      style={{
                        marginBottom: "14px",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Credentials</span>
                        <span
                          style={{
                            color: integration.hasCredentials ? "var(--green)" : "var(--red)",
                          }}
                        >
                          {integration.hasCredentials ? "Encrypted" : "Missing"}
                        </span>
                      </div>
                      {integration.createdAt && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Connected</span>
                          <span>{formatDate(integration.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleDisconnect(integration!)}
                          disabled={isLoading}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(240, 180, 41, 0.25)",
                            background: "var(--yellow-subtle)",
                            color: "var(--yellow)",
                            fontSize: "12px",
                            fontWeight: 600,
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {isLoading ? "..." : "Disconnect"}
                        </button>
                        <button
                          onClick={() => handleDelete(integration!)}
                          disabled={isLoading}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(231, 76, 60, 0.25)",
                            background: "var(--red-subtle)",
                            color: "var(--red)",
                            fontSize: "12px",
                            fontWeight: 600,
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : isDisconnected || isError ? (
                      <>
                        <button
                          onClick={() => handleReconnect(integration!)}
                          disabled={isLoading}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            background: "var(--accent)",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 600,
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          Reconnect
                        </button>
                        <button
                          onClick={() => handleDelete(integration!)}
                          disabled={isLoading}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(231, 76, 60, 0.25)",
                            background: "var(--red-subtle)",
                            color: "var(--red)",
                            fontSize: "12px",
                            fontWeight: 600,
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditIntegration(null);
                          setConnectProvider(provider);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          background: "var(--accent)",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Connect
                      </button>
                    )}
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
    </>
  );
}
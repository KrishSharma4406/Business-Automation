"use client";

import { useEffect, useState } from "react";
import ConnectModal from "@/src/components/integrations/connect-modal";

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
  {
    provider: "GROK",
    name: "Grok",
    description: "AI and automation",
    icon: "🤖",
    color: "#6366f1",
  },
  {
    provider: "GOOGLE",
    name: "Google",
    description: "Google Workspace",
    icon: "🔍",
    color: "#4285f4",
  },
  {
    provider: "GMAIL",
    name: "Gmail",
    description: "Email automation",
    icon: "✉️",
    color: "#ea4335",
  },
  {
    provider: "SLACK",
    name: "Slack",
    description: "Team communication",
    icon: "💬",
    color: "#e01e5a",
  },
  {
    provider: "WHATSAPP",
    name: "WhatsApp",
    description: "Customer communication",
    icon: "📱",
    color: "#25d366",
  },
  {
    provider: "STRIPE",
    name: "Stripe",
    description: "Payments",
    icon: "💳",
    color: "#635bff",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectProvider, setConnectProvider] = useState<
    (typeof providers)[number] | null
  >(null);
  const [editIntegration, setEditIntegration] = useState<Integration | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState("");

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/integrations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load integrations");
      }

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

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect");
      }

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
    const providerInfo = providers.find(
      (p) => p.provider === integration.provider
    );
    if (providerInfo) {
      setConnectProvider(providerInfo);
    }
  }

  async function handleDelete(integration: Integration) {
    const confirmed = window.confirm(
      `Permanently delete the ${integration.name} integration? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(integration.id);

      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

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

  const connectedCount = integrations.filter(
    (i) => i.status === "CONNECTED"
  ).length;

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
          color: "#e4e4e7",
          padding: "40px",
          fontFamily:
            'var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #818cf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                }}
              >
                Integrations
              </h1>
              <p style={{ color: "#71717a", fontSize: "15px" }}>
                Connect the tools your business uses with Autozip.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  fontSize: "14px",
                  color: "#a5b4fc",
                }}
              >
                {connectedCount} connected
              </div>
            </div>
          </div>

          {/* Success banner */}
          {successMessage && (
            <div
              style={{
                marginBottom: "24px",
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
                color: "#4ade80",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <span>✓</span> {successMessage}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div
              style={{
                marginBottom: "24px",
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#f87171",
                fontSize: "14px",
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
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "20px",
                marginTop: "32px",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "200px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "20px",
                marginTop: "32px",
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
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        isConnected
                          ? "rgba(34, 197, 94, 0.25)"
                          : isError
                          ? "rgba(239, 68, 68, 0.25)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                      padding: "24px",
                      transition: "all 0.2s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `1px solid ${provider.color}40`;
                      e.currentTarget.style.boxShadow = `0 0 30px ${provider.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = `1px solid ${
                        isConnected
                          ? "rgba(34, 197, 94, 0.25)"
                          : isError
                          ? "rgba(239, 68, 68, 0.25)"
                          : "rgba(255,255,255,0.06)"
                      }`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Gradient accent */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: isConnected
                          ? `linear-gradient(90deg, #22c55e, ${provider.color})`
                          : `linear-gradient(90deg, ${provider.color}60, ${provider.color}20)`,
                        opacity: isConnected ? 1 : 0.5,
                      }}
                    />

                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: `${provider.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                          }}
                        >
                          {provider.icon}
                        </div>

                        <div>
                          <h3
                            style={{
                              fontSize: "17px",
                              fontWeight: 700,
                              color: "#f4f4f5",
                            }}
                          >
                            {provider.name}
                          </h3>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#71717a",
                              marginTop: "2px",
                            }}
                          >
                            {provider.description}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: isConnected
                            ? "rgba(34, 197, 94, 0.12)"
                            : isError
                            ? "rgba(239, 68, 68, 0.12)"
                            : isDisconnected
                            ? "rgba(234, 179, 8, 0.12)"
                            : "rgba(113, 113, 122, 0.12)",
                          color: isConnected
                            ? "#4ade80"
                            : isError
                            ? "#f87171"
                            : isDisconnected
                            ? "#fbbf24"
                            : "#71717a",
                          border: `1px solid ${
                            isConnected
                              ? "rgba(34, 197, 94, 0.2)"
                              : isError
                              ? "rgba(239, 68, 68, 0.2)"
                              : isDisconnected
                              ? "rgba(234, 179, 8, 0.2)"
                              : "rgba(113, 113, 122, 0.15)"
                          }`,
                        }}
                      >
                        {isConnected
                          ? "● Connected"
                          : isError
                          ? "● Error"
                          : isDisconnected
                          ? "● Disconnected"
                          : "○ Available"}
                      </div>
                    </div>

                    {/* Metadata & credentials indicator */}
                    {integration && (
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          fontSize: "13px",
                          color: "#a1a1aa",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span>Credentials</span>
                          <span
                            style={{
                              color: integration.hasCredentials
                                ? "#4ade80"
                                : "#f87171",
                            }}
                          >
                            {integration.hasCredentials
                              ? "🔒 Encrypted"
                              : "⚠ Missing"}
                          </span>
                        </div>
                        {integration.createdAt && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
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
                              padding: "10px 16px",
                              borderRadius: "10px",
                              border: "1px solid rgba(234, 179, 8, 0.25)",
                              background: "rgba(234, 179, 8, 0.08)",
                              color: "#fbbf24",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isLoading ? "..." : "Disconnect"}
                          </button>

                          <button
                            onClick={() => handleDelete(integration!)}
                            disabled={isLoading}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#f87171",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              transition: "all 0.15s ease",
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
                              padding: "10px 16px",
                              borderRadius: "10px",
                              border: "none",
                              background: `linear-gradient(135deg, ${provider.color}, ${provider.color}cc)`,
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              transition: "all 0.15s ease",
                            }}
                          >
                            Reconnect
                          </button>

                          <button
                            onClick={() => handleDelete(integration!)}
                            disabled={isLoading}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#f87171",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              transition: "all 0.15s ease",
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
                            padding: "10px 16px",
                            borderRadius: "10px",
                            border: "none",
                            background: `linear-gradient(135deg, ${provider.color}, ${provider.color}cc)`,
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
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

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </main>

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
              `${connectProvider.name} ${
                editIntegration ? "updated" : "connected"
              } successfully`
            );
            loadIntegrations();
          }}
        />
      )}
    </>
  );
}
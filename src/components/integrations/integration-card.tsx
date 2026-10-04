"use client";

import { useState } from "react";
import ConnectModal from "./connect-modal";

type Props = {
  provider: {
    provider: string;
    name: string;
    description: string;
  };

  integration?: {
    id: string;
    provider: string;
    name: string;
    status: "CONNECTED" | "DISCONNECTED" | "ERROR";
    hasCredentials: boolean;
  };

  onRefresh: () => void;
};

export default function IntegrationCard({
  provider,
  integration,
  onRefresh,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const connected = integration?.status === "CONNECTED";

  async function disconnect() {
    if (!integration) return;

    const confirmed = window.confirm(`Disconnect ${provider.name}?`);
    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/integrations/${integration.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "DISCONNECTED" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect");
      }

      onRefresh();
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${
            connected ? "rgba(46, 204, 113, 0.25)" : "var(--border-default)"
          }`,
          borderRadius: "var(--radius-lg)",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
            {provider.name}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {provider.description}
          </p>
        </div>

        <div style={{ marginBottom: "14px" }}>
          {connected ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--green)",
                padding: "3px 8px",
                borderRadius: "10px",
                background: "var(--green-subtle)",
                border: "1px solid rgba(46, 204, 113, 0.2)",
              }}
            >
              Connected
            </span>
          ) : integration?.status === "ERROR" ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--red)",
                padding: "3px 8px",
                borderRadius: "10px",
                background: "var(--red-subtle)",
                border: "1px solid rgba(231, 76, 60, 0.2)",
              }}
            >
              Error
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                padding: "3px 8px",
                borderRadius: "10px",
                background: "rgba(113, 113, 122, 0.12)",
                border: "1px solid rgba(113, 113, 122, 0.15)",
              }}
            >
              Not connected
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {connected ? (
            <>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Manage
              </button>

              <button
                onClick={disconnect}
                disabled={deleting}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(231, 76, 60, 0.25)",
                  background: "var(--red-subtle)",
                  color: "var(--red)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? "Disconnecting..." : "Disconnect"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <ConnectModal
          provider={provider}
          integration={integration}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
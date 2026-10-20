"use client";

import { useState } from "react";

type Props = {
  provider: {
    provider: string;
    name: string;
    description: string;
  };

  integration?: {
    id: string;
    status: string;
  };

  onClose: () => void;
  onSuccess: () => void;
};

export default function ConnectModal({
  provider,
  integration,
  onClose,
  onSuccess,
}: Props) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isUpdate = Boolean(integration);

  async function submit() {
    try {
      setLoading(true);
      setError("");

      if (!apiKey.trim()) {
        setError("API key is required");
        return;
      }

      const response = await fetch(
        integration
          ? `/api/integrations/${integration.id}`
          : "/api/integrations",
        {
          method: integration ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            integration
              ? {
                  credentials: { apiKey },
                  status: "CONNECTED",
                }
              : {
                  provider: provider.provider,
                  name: provider.name,
                  credentials: { apiKey },
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      setApiKey("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="az-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="az-modal-box" style={{ maxWidth: "460px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--az-border)",
            background: "rgba(22, 26, 32, 0.4)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="az-status-dot" />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--az-font-mono)" }}>
                {isUpdate ? "UPDATE CREDENTIALS" : "CONNECT SERVICE"} // {provider.name.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--az-text-muted)", marginTop: "3px" }}>
              {provider.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="az-btn-secondary"
            style={{ padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          <div className="az-field" style={{ marginBottom: "12px" }}>
            <label className="az-field-label">API Key or Token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isUpdate ? "Enter updated API key..." : "Paste API key or access token..."}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) submit();
              }}
              className="az-field-input"
              autoFocus
            />
          </div>

          <p style={{ fontSize: "11px", color: "var(--az-text-muted)", lineHeight: 1.4 }}>
            🔒 Credentials are encrypted with AES-256 before storage and only decrypted when dispatching automated actions.
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "14px",
                padding: "8px 12px",
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

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px solid var(--az-border)",
            }}
          >
            <button
              onClick={onClose}
              className="az-btn-secondary"
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className="az-btn-primary"
              style={{ fontSize: "12px", padding: "6px 18px" }}
            >
              {loading
                ? isUpdate
                  ? "Saving..."
                  : "Connecting..."
                : isUpdate
                ? "Update Key"
                : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
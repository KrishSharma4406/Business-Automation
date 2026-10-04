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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-overlay)",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {isUpdate ? "Update" : "Connect"} {provider.name}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              {provider.description}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Close
          </button>
        </div>

        {/* Input */}
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: "6px",
          }}
        >
          API Key
        </label>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={isUpdate ? "Enter new API key" : "Enter API key"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) submit();
          }}
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
          }}
          autoFocus
        />

        <p
          style={{
            marginTop: "6px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          Credentials are encrypted with AES-256-GCM before storage
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
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

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? isUpdate
                ? "Updating..."
                : "Connecting..."
              : isUpdate
              ? "Update"
              : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
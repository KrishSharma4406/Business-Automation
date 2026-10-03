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
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(145deg, #1e1e2e, #16161f)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          animation: "modalSlide 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#f4f4f5",
              }}
            >
              {isUpdate ? "Update" : "Connect"} {provider.name}
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#71717a",
                marginTop: "4px",
              }}
            >
              {provider.description}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#71717a",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 600,
            color: "#a1a1aa",
            marginBottom: "8px",
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
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.3)",
            color: "#f4f4f5",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
          autoFocus
        />

        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#52525b",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🔒 Credentials are encrypted with AES-256-GCM before storage
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
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
            gap: "10px",
            marginTop: "24px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "#a1a1aa",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.15s ease",
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

      <style>{`
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
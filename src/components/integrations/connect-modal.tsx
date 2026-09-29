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
  const [apiKey, setApiKey] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit() {
    try {
      setLoading(true);
      setError("");

      if (!apiKey.trim()) {
        setError(
          "API key is required"
        );

        return;
      }

      const response =
        await fetch(
          integration
            ? `/api/integrations/${integration.id}`
            : "/api/integrations",
          {
            method:
              integration
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              integration
                ? {
                    credentials: {
                      apiKey,
                    },
                    status:
                      "CONNECTED",
                  }
                : {
                    provider:
                      provider.provider,
                    name: provider.name,
                    credentials: {
                      apiKey,
                    },
                  }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to connect"
        );
      }

      setApiKey("");

      onSuccess();
    } catch (error: any) {
      setError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Connect{" "}
            {provider.name}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium">
          API Key
        </label>

        <input
          type="password"
          value={apiKey}
          onChange={(e) =>
            setApiKey(
              e.target.value
            )
          }
          placeholder="Enter API key"
          className="w-full rounded-lg border px-4 py-3 outline-none"
        />

        <p className="mt-2 text-xs text-gray-500">
          Your credential is encrypted
          before it is stored.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Connecting..."
              : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
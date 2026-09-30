"use client";

import { useEffect, useState } from "react";

type Integration = {
  id: string;
  provider: string;
  name: string;
  status:
    | "CONNECTED"
    | "DISCONNECTED"
    | "ERROR";
  metadata?: Record<string, unknown>;
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function fetchIntegrations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/integrations"
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch integrations"
        );
      }

      setIntegrations(
        data.integrations || []
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load integrations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIntegrations();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Integrations
        </h1>

        <p className="mt-4 text-gray-500">
          Loading integrations...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Integrations
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Integrations
        </h1>

        <p className="mt-2 text-gray-500">
          Connect your business tools with
          Autozip.
        </p>
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-xl font-semibold">
            No integrations connected
          </h2>

          <p className="mt-2 text-gray-500">
            Connect a service to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map(
            (integration) => (
              <div
                key={integration.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold">
                  {integration.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {integration.provider}
                </p>

                <div className="mt-4">
                  {integration.status ===
                  "CONNECTED" ? (
                    <span className="text-green-600">
                      ● Connected
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      ○{" "}
                      {integration.status}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}
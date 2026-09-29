"use client";
import IntegrationCard from "@/src/components/integrations/integration-card";

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
  hasCredentials: boolean;
};

const providers = [
  {
    provider: "GROK",
    name: "Grok",
    description: "AI and automation",
  },
  {
    provider: "GOOGLE",
    name: "Google",
    description: "Google Workspace",
  },
  {
    provider: "GMAIL",
    name: "Gmail",
    description: "Email automation",
  },
  {
    provider: "SLACK",
    name: "Slack",
    description: "Team communication",
  },
  {
    provider: "WHATSAPP",
    name: "WhatsApp",
    description: "Customer communication",
  },
  {
    provider: "STRIPE",
    name: "Stripe",
    description: "Payments",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/integrations"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load integrations"
        );
      }

      setIntegrations(
        data.integrations
      );
    } catch (error: any) {
      setError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  function getIntegration(
    provider: string
  ) {
    return integrations.find(
      (integration) =>
        integration.provider ===
        provider
    );
  }

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Integrations
        </h1>

        <div className="mt-8">
          Loading integrations...
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
          Connect the tools your business
          uses with Autozip.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {integrations.length === 0 && (
        <div className="mb-8 rounded-xl border p-8 text-center">
          <h2 className="text-xl font-semibold">
            No integrations yet
          </h2>

          <p className="mt-2 text-gray-500">
            Connect your favorite tools to
            unlock Autozip automations.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => {
          const integration =
            getIntegration(
              provider.provider
            );

          return (
            <IntegrationCard
              key={provider.provider}
              provider={provider}
              integration={integration}
              onRefresh={
                loadIntegrations
              }
            />
          );
        })}
      </div>
    </main>
  );
}
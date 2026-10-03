import { hasStoredCredentials } from "./credentials";

export function sanitizeIntegration(
  integration: any
) {
  return {
    id: integration.id,
    provider: integration.provider,
    name: integration.name,
    status: integration.status,
    metadata: integration.metadata,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,

    hasCredentials: hasStoredCredentials(
      integration.credentials
    ),
  };
}
export function sanitizeIntegration(
  integration: any
) {
  const hasCreds = Boolean(
    integration.credentials &&
      (typeof integration.credentials === "object"
        ? (integration.credentials.encrypted || Object.keys(integration.credentials).length > 0)
        : Boolean(integration.credentials))
  );

  return {
    id: integration.id,
    provider: integration.provider,
    name: integration.name,
    status: integration.status,
    metadata: integration.metadata,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
    hasCredentials: hasCreds,
  };
}
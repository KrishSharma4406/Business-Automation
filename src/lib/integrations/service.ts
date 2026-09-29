import crypto from "crypto";
import { db } from "@/src/prisma/db";
import { encrypt } from "./encryption";

type CreateIntegrationInput = {
  workspaceId: string;
  provider:
    | "GROK"
    | "GOOGLE"
    | "GMAIL"
    | "SLACK"
    | "WHATSAPP"
    | "STRIPE";
  name: string;
  credentials: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export async function getWorkspaceIntegrations(workspaceId: string) {
  return await db.orm.public.Integration
    .where({ workspaceId })
    .orderBy((i) => i.createdAt.desc())
    .select(
      "id",
      "provider",
      "name",
      "status",
      "metadata",
      "createdAt",
      "updatedAt",
      "credentials"
    )
    .all();
}

export async function createIntegration(input: CreateIntegrationInput) {
  const existing = await db.orm.public.Integration
    .where({
      workspaceId: input.workspaceId,
      provider: input.provider,
    })
    .first();

  if (existing) {
    throw new Error("This integration is already connected");
  }

  const encryptedCredentials = encrypt(
    JSON.stringify(input.credentials)
  );

  return await db.orm.public.Integration
    .select("id", "provider", "name", "status", "metadata", "createdAt", "updatedAt")
    .create({
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      provider: input.provider,
      name: input.name,
      status: "CONNECTED",
      credentials: { encrypted: encryptedCredentials },
      metadata: input.metadata ?? {},
    });
}

export async function getWorkspaceIntegration(
  workspaceId: string,
  integrationId: string
) {
  return await db.orm.public.Integration
    .where({
      id: integrationId,
      workspaceId,
    })
    .select(
      "id",
      "provider",
      "name",
      "status",
      "metadata",
      "createdAt",
      "updatedAt",
      "credentials"
    )
    .first();
}

export async function updateIntegration(
  workspaceId: string,
  integrationId: string,
  data: {
    name?: string;
    status?: "CONNECTED" | "DISCONNECTED" | "ERROR";
    credentials?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }
) {
  const integration = await db.orm.public.Integration
    .where({
      id: integrationId,
      workspaceId,
    })
    .first();

  if (!integration) {
    throw new Error("Integration not found");
  }

  let credentialsObj = integration.credentials;

  if (data.credentials) {
    credentialsObj = {
      encrypted: encrypt(JSON.stringify(data.credentials)),
    };
  }

  const updateData: {
    name?: string;
    status?: "CONNECTED" | "DISCONNECTED" | "ERROR";
    credentials?: any;
    metadata?: any;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.credentials !== undefined) updateData.credentials = credentialsObj;
  if (data.metadata !== undefined) updateData.metadata = data.metadata;

  return await db.orm.public.Integration
    .where({ id: integration.id })
    .select("id", "provider", "name", "status", "metadata", "createdAt", "updatedAt")
    .update(updateData);
}

export async function deleteIntegration(
  workspaceId: string,
  integrationId: string
) {
  const integration = await db.orm.public.Integration
    .where({
      id: integrationId,
      workspaceId,
    })
    .first();

  if (!integration) {
    throw new Error("Integration not found");
  }

  await db.orm.public.Integration
    .where({ id: integration.id })
    .delete();

  return {
    success: true,
  };
}
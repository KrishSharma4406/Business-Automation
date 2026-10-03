import crypto from "crypto";

import { db } from "@/src/prisma/db";
import { encrypt } from "./encryption";
import { wrapEncryptedCredentials } from "./credentials";

type IntegrationProvider =
  | "GROK"
  | "GOOGLE"
  | "GMAIL"
  | "SLACK"
  | "WHATSAPP"
  | "STRIPE";

type IntegrationStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

type CreateIntegrationInput = {
  workspaceId: string;
  provider: IntegrationProvider;
  name: string;
  credentials: Record<string, string>;
  metadata?: Record<string, unknown>;
};

const integrationSelect = [
  "id",
  "provider",
  "name",
  "status",
  "metadata",
  "createdAt",
  "updatedAt",
] as const;

export async function getWorkspaceIntegrations(
  workspaceId: string
) {
  return await db.orm.public.Integration
    .where({
      workspaceId,
    })
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

export async function createIntegration(
  input: CreateIntegrationInput
) {
  const existing =
    await db.orm.public.Integration
      .where({
        workspaceId: input.workspaceId,
        provider: input.provider,
      })
      .first();

  const encryptedCredentials = wrapEncryptedCredentials(
    encrypt(JSON.stringify(input.credentials))
  );

  if (existing) {
    if (existing.status === "CONNECTED") {
      throw new Error(
        "This integration is already connected"
      );
    }

    return await db.orm.public.Integration
      .where({
        id: existing.id,
      })
      .select(...integrationSelect)
      .update({
        name: input.name,
        status: "CONNECTED",
        credentials: encryptedCredentials as any,
        metadata: (input.metadata ?? {}) as any,
      });
  }

  return await db.orm.public.Integration
    .select(...integrationSelect)
    .create({
      id: crypto.randomUUID(),

      workspaceId: input.workspaceId,

      provider: input.provider,

      name: input.name,

      status: "CONNECTED",

      credentials: encryptedCredentials as any,

      metadata: (input.metadata ?? {}) as any,
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
    status?: IntegrationStatus;
    credentials?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }
) {
  const integration =
    await db.orm.public.Integration
      .where({
        id: integrationId,
        workspaceId,
      })
      .first();

  if (!integration) {
    throw new Error(
      "Integration not found"
    );
  }

  const updateData: {
    name?: string;
    status?: IntegrationStatus;
    credentials?: ReturnType<typeof wrapEncryptedCredentials>;
    metadata?: Record<string, unknown>;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.credentials !== undefined) {
    updateData.credentials = wrapEncryptedCredentials(
      encrypt(JSON.stringify(data.credentials))
    );
  }

  if (data.metadata !== undefined) {
    updateData.metadata = data.metadata;
  }

  return await db.orm.public.Integration
    .where({
      id: integration.id,
    })
    .select(...integrationSelect)
    .update(updateData as any);
}

export async function deleteIntegration(
  workspaceId: string,
  integrationId: string
) {
  const integration =
    await db.orm.public.Integration
      .where({
        id: integrationId,
        workspaceId,
      })
      .first();

  if (!integration) {
    throw new Error(
      "Integration not found"
    );
  }

  await db.orm.public.Integration
    .where({
      id: integration.id,
    })
    .delete();

  return {
    success: true,
  };
}

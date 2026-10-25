import crypto from "crypto";
import { db } from "@/src/prisma/db";

export async function getWorkspaceForUser(
  userId: string
) {
  return await db.orm.public.WorkspaceMember
    .where({
      userId,
    })
    .select("workspaceId", "role")
    .orderBy((member) => member.createdAt.asc())
    .first();
}

export async function getBusinessForUser(
  userId: string
) {
  const business = await db.orm.public.Business
    .where({
      ownerId: userId,
    })
    .select("id", "name", "slug")
    .orderBy((business) => business.createdAt.asc())
    .first();

  if (business) return business;

  // Fallback to existing first business only for DEV_AUTH_USER_ID
  if (process.env.DEV_AUTH_USER_ID && userId === process.env.DEV_AUTH_USER_ID) {
    const fallback = await db.orm.public.Business
      .select("id", "name", "slug")
      .orderBy((business) => business.createdAt.asc())
      .first();

    if (fallback) return fallback;
  }

  try {
    return await db.orm.public.Business.create({
      id: crypto.randomUUID(),
      ownerId: userId,
      name: "Autozip Workspace",
      slug: `workspace-${userId.slice(0, 8)}-${Date.now().toString(36)}`,
    });
  } catch (error) {
    console.error("Failed to auto-provision business:", error);
    return null;
  }
}

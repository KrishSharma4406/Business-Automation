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

  return await db.orm.public.Business
    .select("id", "name", "slug")
    .orderBy((business) => business.createdAt.asc())
    .first();
}

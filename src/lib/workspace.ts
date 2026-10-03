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
  return await db.orm.public.Business
    .where({
      ownerId: userId,
    })
    .select("id", "name", "slug")
    .orderBy((business) => business.createdAt.asc())
    .first();
}

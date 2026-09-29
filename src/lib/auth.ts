import crypto from "crypto";
import { db } from "@/src/prisma/db";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type Session = {
  user?: SessionUser;
};

export async function auth(): Promise<Session | null> {
  try {
    const existingUser = await db.orm.public.User.first();
    if (existingUser) {
      const membership = await db.orm.public.WorkspaceMember
        .where({ userId: existingUser.id })
        .first();

      if (!membership) {
        let ws = await db.orm.public.Workspace.first();
        if (!ws) {
          ws = await db.orm.public.Workspace.create({
            id: crypto.randomUUID(),
            name: "Main Workspace",
            slug: "main",
          });
        }
        await db.orm.public.WorkspaceMember.create({
          id: crypto.randomUUID(),
          userId: existingUser.id,
          workspaceId: ws.id,
          role: "OWNER",
        });
      }

      return {
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
      };
    }

    const userId = crypto.randomUUID();
    const workspaceId = crypto.randomUUID();

    const user = await db.orm.public.User.create({
      id: userId,
      email: "demo@autozip.ai",
      name: "Demo Admin",
    });

    const workspace = await db.orm.public.Workspace.create({
      id: workspaceId,
      name: "Main Workspace",
      slug: "main",
    });

    await db.orm.public.WorkspaceMember.create({
      id: crypto.randomUUID(),
      userId: user.id,
      workspaceId: workspace.id,
      role: "OWNER",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Auth helper error:", error);
    return {
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: "demo@autozip.ai",
        name: "Demo User",
      },
    };
  }
}

import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import {
  createIntegration,
  getWorkspaceIntegrations,
} from "@/src/lib/integrations/service";
import { sanitizeIntegration } from "@/src/lib/integrations/sanitize";
import { createIntegrationSchema } from "@/src/lib/validations/integration";
import { auth } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const membership = await db.orm.public.WorkspaceMember
      .where({
        userId: session.user.id,
      })
      .select("workspaceId")
      .first();

    if (!membership) {
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    const integrations = await getWorkspaceIntegrations(
      membership.workspaceId
    );

    return NextResponse.json({
      integrations: integrations.map(sanitizeIntegration),
    });
  } catch (error) {
    console.error("GET /api/integrations error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch integrations",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const membership = await db.orm.public.WorkspaceMember
      .where({
        userId: session.user.id,
      })
      .select("workspaceId")
      .first();

    if (!membership) {
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const validation = createIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const integration = await createIntegration({
      workspaceId: membership.workspaceId,
      ...validation.data,
    });

    return NextResponse.json(
      {
        integration,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    if (error?.message === "This integration is already connected") {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 409,
        }
      );
    }

    console.error("POST /api/integrations error:", error);

    return NextResponse.json(
      {
        error: "Failed to create integration",
      },
      {
        status: 500,
      }
    );
  }
}
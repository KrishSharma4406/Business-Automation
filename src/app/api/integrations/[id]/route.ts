import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";

import {
  getWorkspaceIntegration,
  updateIntegration,
  deleteIntegration,
} from "@/src/lib/integrations/service";

import { sanitizeIntegration } from "@/src/lib/integrations/sanitize";

import {
  updateIntegrationSchema,
} from "@/src/lib/validations/integration";

import { auth } from "@/src/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getWorkspaceId(
  userId: string
) {
  const membership =
    await db.orm.public.WorkspaceMember
      .where({
        userId,
      })
      .select("workspaceId")
      .first();

  return membership?.workspaceId;
}

/*
|--------------------------------------------------------------------------
| GET /api/integrations/:id
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const workspaceId =
      await getWorkspaceId(
        session.user.id
      );

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    const { id } =
      await context.params;

    const integration =
      await getWorkspaceIntegration(
        workspaceId,
        id
      );

    if (!integration) {
      return NextResponse.json(
        {
          error: "Integration not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      integration:
        sanitizeIntegration(
          integration
        ),
    });
  } catch (error) {
    console.error(
      "GET /api/integrations/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch integration",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/integrations/:id
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const workspaceId =
      await getWorkspaceId(
        session.user.id
      );

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    const validation =
      updateIntegrationSchema.safeParse(
        body
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details:
            validation.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const integration =
      await updateIntegration(
        workspaceId,
        id,
        validation.data
      );

    return NextResponse.json({
      integration,
    });
  } catch (error: any) {
    if (
      error?.message ===
      "Integration not found"
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 404,
        }
      );
    }

    console.error(
      "PATCH /api/integrations/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update integration",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/integrations/:id
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: Request,
  context: RouteContext
) {
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

    const workspaceId =
      await getWorkspaceId(
        session.user.id
      );

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    const { id } =
      await context.params;

    const result =
      await deleteIntegration(
        workspaceId,
        id
      );

    return NextResponse.json(
      result
    );
  } catch (error: any) {
    if (
      error?.message ===
      "Integration not found"
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 404,
        }
      );
    }

    console.error(
      "DELETE /api/integrations/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete integration",
      },
      {
        status: 500,
      }
    );
  }
}
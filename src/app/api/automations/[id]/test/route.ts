
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import { getBusinessForUser } from "@/src/lib/workspace";
import { executeAutomation } from "@/src/lib/automation-engine";
import type {
  AutomationAction,
  AutomationConfig,
  AutomationTrigger,
} from "@/src/lib/automation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Authenticate the user.
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Resolve the user's authorized business.
    const business = await getBusinessForUser(userId);

    if (!business) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // 3. Read the automation ID.
    const { id } = await context.params;

    // 4. Find the automation within this business only.
    const automation = await db.orm.public.Automation
      .where({
        id,
        businessId: business.id,
      })
      .select(
        "id",
        "businessId",
        "name",
        "trigger",
        "action",
        "config",
        "enabled"
      )
      .first();

    if (!automation) {
      return NextResponse.json(
        { success: false, error: "Automation not found" },
        { status: 404 }
      );
    }

    // 5. Accept optional test data.
    let body: Record<string, unknown> = {};

    try {
      const parsed: unknown = await request.json();

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Request body must be a JSON object.",
          },
          { status: 400 }
        );
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const data = body.data ?? {};

    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "'data' must be a JSON object.",
        },
        { status: 400 }
      );
    }

    // 6. Execute only this automation.
    // Manual tests are allowed even when the automation is disabled.
    const startTime = Date.now();
    const startedAt = new Date(startTime).toISOString();

    const result = await executeAutomation({
      trigger: automation.trigger as AutomationTrigger,
      action: automation.action as AutomationAction,
      config: (automation.config ?? undefined) as
        | AutomationConfig
        | undefined,
      data: {
        ...(data as Record<string, unknown>),
        businessId: business.id,
        testMode: true,
      },
    });

    const completedTime = Date.now();

    const errorMessage =
      !result.success
        ? "message" in result &&
          typeof result.message === "string"
          ? result.message
          : "Automation action failed."
        : undefined;

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? "Automation test completed."
        : "Automation test completed with an action failure.",
      testMode: true,
      execution: {
        automationId: automation.id,
        automationName: automation.name,
        trigger: automation.trigger,
        action: automation.action,
        enabled: automation.enabled,
        startedAt,
        completedAt: new Date(completedTime).toISOString(),
        durationMs: completedTime - startTime,
        result,
        ...(errorMessage ? { error: errorMessage } : {}),
      },
      historySaved: false,
    });
  } catch (error) {
    console.error("POST /api/automations/[id]/test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to test automation.",
      },
      { status: 500 }
    );
  }
}

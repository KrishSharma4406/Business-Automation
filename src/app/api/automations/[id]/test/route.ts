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
  params: Promise<{
    id: string;
  }>;
};

/**
 * POST /api/automations/[id]/test
 * Executes one automation manually without changing its enabled state
 * or writing an execution-history record.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const business = await getBusinessForUser(userId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    const { id } = await context.params;

    const automation = await db.orm.public.Automation
      .where({ id, businessId: business.id })
      .select("id", "businessId", "name", "trigger", "action", "config")
      .first();

    if (!automation) {
      return NextResponse.json(
        { success: false, error: "Automation not found" },
        { status: 404 }
      );
    }

    let body: { data?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    let data: Record<string, unknown> = {
      name: "Test Lead",
      email: "test@example.com",
      source: "manual_test",
    };

    if (body.data !== undefined) {
      if (
        body.data === null ||
        typeof body.data !== "object" ||
        Array.isArray(body.data)
      ) {
        return NextResponse.json(
          { success: false, error: "The data field must be a JSON object" },
          { status: 400 }
        );
      }
      data = body.data as Record<string, unknown>;
    }

    const startedAt = Date.now();
    let execution: Awaited<ReturnType<typeof executeAutomation>>;

    try {
      execution = await executeAutomation({
        trigger: automation.trigger as AutomationTrigger,
        action: automation.action as AutomationAction,
        config: (automation.config ?? undefined) as
          | AutomationConfig
          | undefined,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Automation execution failed";
      return NextResponse.json(
        {
          success: false,
          error: message,
          execution: {
            success: false,
            durationMs: Date.now() - startedAt,
            error: message,
          },
          historySaved: false,
        },
        { status: 200 }
      );
    }

    const durationMs = Date.now() - startedAt;
    const executionSuccess = execution.success === true;
    const executionMessage =
      "message" in execution && typeof execution.message === "string"
        ? execution.message
        : undefined;

    return NextResponse.json(
      {
        success: executionSuccess,
        ...(executionMessage ? { error: executionMessage } : {}),
        automation: { id: automation.id, name: automation.name },
        execution: {
          success: executionSuccess,
          durationMs,
          result: execution,
          ...(executionMessage ? { error: executionMessage } : {}),
        },
        historySaved: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/automations/[id]/test error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test automation" },
      { status: 500 }
    );
  }
}

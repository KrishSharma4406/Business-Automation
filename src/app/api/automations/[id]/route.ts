import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import { getBusinessForUser } from "@/src/lib/workspace";
import type {
  AutomationAction,
  AutomationTrigger,
} from "@/src/lib/automation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_TRIGGERS: AutomationTrigger[] = [
  "new_lead",
  "new_customer",
  "new_message",
  "lead_qualified",
  "conversation_received",
];

const VALID_ACTIONS: AutomationAction[] = [
  "ai_qualify_lead",
  "generate_response",
  "send_email",
  "send_whatsapp",
  "notify_owner",
  "create_task",
];

/**
 * GET /api/automations/[id]
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
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
      .select(
        "id",
        "businessId",
        "name",
        "trigger",
        "action",
        "config",
        "enabled",
        "description",
        "createdAt",
        "updatedAt"
      )
      .first();

    if (!automation) {
      return NextResponse.json(
        { success: false, error: "Automation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (error) {
    console.error("GET /api/automations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch automation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automations/[id]
 * Updates an automation with business ownership check.
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Automation
      .where({ id, businessId: business.id })
      .select("id")
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Automation not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.enabled === "boolean") {
      updateData.enabled = body.enabled;
    }

    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim() || null;
    }

    if (
      typeof body.trigger === "string" &&
      VALID_TRIGGERS.includes(body.trigger as AutomationTrigger)
    ) {
      updateData.trigger = body.trigger;
    }

    if (
      typeof body.action === "string" &&
      VALID_ACTIONS.includes(body.action as AutomationAction)
    ) {
      updateData.action = body.action;
    }

    await db.orm.public.Automation
      .where({ id })
      .update(updateData as any);

    return NextResponse.json({
      success: true,
      message: "Automation updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/automations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update automation." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/automations/[id]
 * Deletes an automation with business ownership check.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
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

    const existing = await db.orm.public.Automation
      .where({ id, businessId: business.id })
      .select("id")
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Automation not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Automation
      .where({ id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Automation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/automations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete automation." },
      { status: 500 }
    );
  }
}

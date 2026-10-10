
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import { getBusinessForUser } from "@/src/lib/workspace";
import type {
    AutomationAction,
    AutomationTrigger,
} from "@/src/lib/automation";

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
 * GET /api/automations
 * Returns automations belonging to the authenticated user's business.
 */
export async function GET() {
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

        const automations = await db.orm.public.Automation
            .where({ businessId: business.id })
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
            .all();

        return NextResponse.json({
            success: true,
            automations,
            stats: {
                total: automations.length,
                active: automations.filter((item) => item.enabled).length,
                paused: automations.filter((item) => !item.enabled).length,
                // Execution history is not stored in the current Automation schema.
                executions: 0,
            },
        });
    } catch (error) {
        console.error("GET /api/automations error:", error);

        return NextResponse.json(
            { success: false, error: "Failed to load automations" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/automations
 * Creates an automation for the authenticated user's business.
 */
export async function POST(request: Request) {
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

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const name =
            typeof body.name === "string" ? body.name.trim() : "";

        const trigger = body.trigger;
        const action = body.action;

        const description =
            typeof body.description === "string"
                ? body.description.trim() || null
                : null;

        const enabled =
            typeof body.enabled === "boolean" ? body.enabled : true;

        const config =
            body.config !== null &&
                typeof body.config === "object" &&
                !Array.isArray(body.config)
                ? body.config
                : null;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Automation name is required" },
                { status: 400 }
            );
        }

        if (
            typeof trigger !== "string" ||
            !VALID_TRIGGERS.includes(trigger as AutomationTrigger)
        ) {
            return NextResponse.json(
                { success: false, error: "Invalid automation trigger" },
                { status: 400 }
            );
        }

        if (
            typeof action !== "string" ||
            !VALID_ACTIONS.includes(action as AutomationAction)
        ) {
            return NextResponse.json(
                { success: false, error: "Invalid automation action" },
                { status: 400 }
            );
        }

        const automation = await db.orm.public.Automation.create({
            id: randomUUID(),
            businessId: business.id,
            name,
            trigger,
            action,
            config: config as any,
            enabled,
            description,
        });

        return NextResponse.json(
            {
                success: true,
                automation,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/automations error:", error);

        return NextResponse.json(
            { success: false, error: "Failed to create automation" },
            { status: 500 }
        );
    }
}

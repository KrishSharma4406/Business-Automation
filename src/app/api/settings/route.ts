import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getBusinessForUser, getWorkspaceForUser } from "@/src/lib/workspace";
import { db } from "@/src/prisma/db";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name cannot be empty").optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const business = await getBusinessForUser(session.user.id);
    const workspaceMember = await getWorkspaceForUser(session.user.id);

    // Count integrations for this workspace if available
    let activeIntegrationsCount = 0;
    if (workspaceMember?.workspaceId) {
      const integrations = await db.orm.public.Integration
        .where({
          workspaceId: workspaceMember.workspaceId,
          status: "CONNECTED",
        })
        .select("id")
        .all();
      activeIntegrationsCount = integrations.length;
    }

    const origin =
      request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("x-forwarded-host")}`
        : new URL(request.url).origin;

    const webhookUrl = `${origin}/api/webhooks/lead${business ? `?businessId=${business.id}` : ""}`;

    return NextResponse.json({
      success: true,
      settings: {
        user: {
          id: session.user.id,
          name: session.user.name || "Operator",
          email: session.user.email,
          role: workspaceMember?.role || "ADMIN",
        },
        business: {
          id: business?.id,
          name: business?.name || "Autoleep Enterprise",
          slug: business?.slug,
        },
        integrations: {
          activeCount: activeIntegrationsCount,
        },
        webhook: {
          path: "/api/webhooks/lead",
          fullUrl: webhookUrl,
          businessId: business?.id,
          status: "Live & Listening",
        },
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const business = await getBusinessForUser(session.user.id);

    if (!business) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = UpdateSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updatePayload: Record<string, any> = {};

    if (data.companyName) updatePayload.name = data.companyName;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.website !== undefined) updatePayload.website = data.website || null;

    if (Object.keys(updatePayload).length > 0) {
      await db.orm.public.Business
        .where({ id: business.id })
        .update(updatePayload as any);
    }

    const updated = await db.orm.public.Business
      .where({ id: business.id })
      .select("id", "name", "slug")
      .first();

    return NextResponse.json({
      success: true,
      business: updated,
    });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

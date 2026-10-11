import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import { qualifyLead } from "@/src/lib/ai/lead-qualification";
import { getBusinessForUser } from "@/src/lib/workspace";
import { CreateLeadSchema } from "@/src/lib/validations/lead";
import { db } from "@/src/prisma/db";
import { runAutomationsForEvent } from "@/src/lib/automation-runner";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const business = await getBusinessForUser(session.user.id);

    if (!business) {
      return NextResponse.json({
        success: true,
        leads: [],
      });
    }

    const leads = await db.orm.public.Lead
      .where({
        businessId: business.id,
      })
      .orderBy((lead) => lead.createdAt.desc())
      .select(
        "id",
        "businessId",
        "name",
        "email",
        "phone",
        "company",
        "message",
        "source",
        "status",
        "priority",
        "aiScore",
        "aiSummary",
        "aiResponse",
        "createdAt"
      )
      .all();

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leads",
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
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const data = CreateLeadSchema.parse(body);

    let businessId = data.businessId;

    if (!businessId) {
      const business = await getBusinessForUser(session.user.id);

      if (!business) {
        return NextResponse.json(
          {
            success: false,
            error: "Business not found",
          },
          {
            status: 404,
          }
        );
      }

      businessId = business.id;
    }

    let aiResult: {
      priority: "low" | "medium" | "high" | "urgent";
      score: number;
      summary: string;
      response: string;
    } = {
      priority: "medium",
      score: 50,
      summary: "Lead created",
      response: "Thank you for reaching out! We'll get back to you shortly.",
    };

    try {
      aiResult = await qualifyLead({
        name: data.name,
        email: data.email || undefined,
        company: data.company,
        message: data.message,
      });
    } catch (qualifyErr) {
      console.warn("AI qualification fallback used:", qualifyErr);
    }

    const lead = await db.orm.public.Lead.create({
      id: crypto.randomUUID(),
      businessId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message || null,
      source: data.source || "dashboard",
      status: "new",
      priority: aiResult.priority,
      aiScore: aiResult.score,
      aiSummary: aiResult.summary,
      aiResponse: aiResult.response,
    });

    // Trigger automations for the new lead
    let automationResults = null;
    try {
      automationResults = await runAutomationsForEvent({
        businessId,
        trigger: "new_lead",
        data: {
          leadId: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          message: lead.message,
          source: lead.source,
          priority: lead.priority,
          aiScore: lead.aiScore,
          aiSummary: lead.aiSummary,
          aiResponse: lead.aiResponse,
        },
      });

      if (lead.priority === "urgent" || lead.priority === "high") {
        await runAutomationsForEvent({
          businessId,
          trigger: "lead_qualified",
          data: {
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            message: lead.message,
            priority: lead.priority,
            aiScore: lead.aiScore,
          },
        });
      }
    } catch (autoErr) {
      console.error("Automation execution error:", autoErr);
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        businessId: lead.businessId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        message: lead.message,
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        aiScore: lead.aiScore,
        aiSummary: lead.aiSummary,
        aiResponse: lead.aiResponse,
      },
      automations: automationResults,
    });
  } catch (error) {
    console.error("Failed to create lead:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create lead",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        if (typeof body.id === "string") {
          id = body.id;
        }
      } catch {
        // Ignore body parse errors if id is in query params
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const lead = await db.orm.public.Lead
      .where({
        id,
        businessId: business.id,
      })
      .select("id")
      .first();

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Lead
      .where({ id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete lead",
      },
      {
        status: 500,
      }
    );
  }
}

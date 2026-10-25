import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { qualifyLead } from "@/src/lib/ai/lead-qualification";
import { runAutomationsForEvent } from "@/src/lib/automation-runner";

export async function GET() {
  return NextResponse.json({
    status: "listening",
    service: "Autozip Inbound Lead Webhook Ingress",
    endpoint: "/api/webhooks/lead",
    acceptedMethods: ["POST"],
    instructions: "POST JSON or form data with name, email, phone, company, message to ingest leads automatically.",
  });
}

export async function POST(req: NextRequest) {
  try {
    let payload: Record<string, any> = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        payload = await req.json();
      } catch {
        payload = {};
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      try {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          payload[key] = value.toString();
        }
      } catch {
        payload = {};
      }
    } else {
      try {
        payload = await req.json();
      } catch {
        payload = {};
      }
    }

    const { searchParams } = new URL(req.url);

    // 1. Resolve Target Business Node
    const requestedBusinessId =
      searchParams.get("businessId") ||
      req.headers.get("x-business-id") ||
      payload.businessId;

    const requestedSlug =
      searchParams.get("slug") ||
      req.headers.get("x-business-slug") ||
      payload.slug;

    let business: { id: string; name: string; slug: string } | null = null;

    if (requestedBusinessId) {
      business = await db.orm.public.Business
        .where({ id: requestedBusinessId })
        .select("id", "name", "slug")
        .first();
    } else if (requestedSlug) {
      business = await db.orm.public.Business
        .where({ slug: requestedSlug })
        .select("id", "name", "slug")
        .first();
    }

    // Fallback: Resolve the primary business
    if (!business) {
      business = await db.orm.public.Business
        .select("id", "name", "slug")
        .orderBy((b) => b.createdAt.asc())
        .first();
    }

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: "No active workspace or business node found to ingest this lead.",
        },
        { status: 404 }
      );
    }

    // 2. Extract Lead Data
    const name = String(payload.name || payload.fullName || payload.contact_name || "").trim() || "Inbound Webhook Lead";
    const email = payload.email || payload.emailAddress || payload.contact_email || null;
    const phone = payload.phone || payload.phoneNumber || payload.mobile || payload.whatsapp || null;
    const company = payload.company || payload.organization || payload.business || null;
    const message = payload.message || payload.notes || payload.inquiry || payload.comment || null;
    const source = payload.source || payload.channel || "webhook";

    // 3. AI Lead Qualification
    let aiResult = {
      priority: "medium" as "low" | "medium" | "high" | "urgent",
      score: 50,
      summary: "Inbound webhook lead ingested",
      response: "Thank you for reaching out! Our team will get back to you shortly.",
    };

    try {
      aiResult = await qualifyLead({
        name,
        email: email || undefined,
        company: company || undefined,
        message: message || undefined,
      });
    } catch (qualifyErr) {
      console.warn("AI qualification fallback used for webhook lead:", qualifyErr);
    }

    // 4. Ingest Lead into Database
    const lead = await db.orm.public.Lead.create({
      id: crypto.randomUUID(),
      businessId: business.id,
      name,
      email: email ? String(email).trim() : null,
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : null,
      message: message ? String(message).trim() : null,
      source: String(source),
      status: "new",
      priority: aiResult.priority,
      aiScore: aiResult.score,
      aiSummary: aiResult.summary,
      aiResponse: aiResult.response,
    });

    // 5. Trigger Autonomous Pipelines
    const automationData = {
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
    };

    let automationResults = null;
    let qualifiedAutomationResults = null;

    try {
      automationResults = await runAutomationsForEvent({
        businessId: business.id,
        trigger: "new_lead",
        data: automationData,
      });
    } catch (autoErr) {
      console.error("Webhook new_lead automation error:", autoErr);
    }

    if (lead.priority === "urgent" || lead.priority === "high") {
      try {
        qualifiedAutomationResults = await runAutomationsForEvent({
          businessId: business.id,
          trigger: "lead_qualified",
          data: automationData,
        });
      } catch (autoErr) {
        console.error("Webhook lead_qualified automation error:", autoErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead ingested and processed successfully.",
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
        automations: {
          newLead: automationResults,
          leadQualified: qualifiedAutomationResults,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/webhooks/lead error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process inbound webhook lead.",
      },
      { status: 500 }
    );
  }
}

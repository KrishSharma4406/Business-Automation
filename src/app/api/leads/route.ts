import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import { qualifyLead } from "@/src/lib/ai/lead-qualification";
import { getBusinessForUser } from "@/src/lib/workspace";
import { CreateLeadSchema } from "@/src/lib/validations/lead";
import { db } from "@/src/prisma/db";

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
      const business = await getBusinessForUser(
        session.user.id
      );

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

    const aiResult = await qualifyLead({
      name: data.name,
      email: data.email || undefined,
      company: data.company,
      message: data.message,
    });

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
    });
  } catch (error) {
    console.error(error);

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

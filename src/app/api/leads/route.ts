import { NextResponse } from "next/server";
import { z } from "zod";

import {
  CreateLeadSchema,
} from "@/src/lib/validations/lead";

import { qualifyLead } from "@/src/lib/ai/lead-qualification";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = CreateLeadSchema.parse(body);

    const aiResult = await qualifyLead({
      name: data.name,
      email: data.email || undefined,
      company: data.company,
      message: data.message,
    });

    return NextResponse.json({
      success: true,

      lead: {
        ...data,

        aiScore: aiResult.score,
        aiSummary: aiResult.summary,
        aiResponse: aiResult.response,
        priority: aiResult.priority,
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
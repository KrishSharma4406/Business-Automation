import { NextResponse } from "next/server";
import { qualifyLead } from "@/src/lib/ai/lead-qualification";

export async function POST() {
  try {
    const result = await qualifyLead({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      company: "Rahul Technologies",
      message:
        "We need an ecommerce website for our business. Our budget is around ₹2 lakh and we need it completed within 3 weeks.",
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI qualification test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI qualification failed.",
        details: error,
      },
      {
        status: 500,
      }
    );
  }
}

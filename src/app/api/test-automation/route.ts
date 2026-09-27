import { NextResponse } from "next/server";

import { executeAutomation } from "@/src/lib/automation-engine";

export async function POST() {
  try {
    const result = await executeAutomation({
      trigger: "new_lead",

      action: "ai_qualify_lead",

      config: {
        minimumScore: 80,
        notifyOwner: true,
      },

      data: {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        company: "Rahul Technologies",
        message:
          "We need an ecommerce website. Budget is ₹2 lakh and we need it within 3 weeks.",
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Automation failed.",
      },
      {
        status: 500,
      }
    );
  }
}
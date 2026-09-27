import { NextResponse } from "next/server";

import { executeAutomation } from "@/src/lib/automation-engine";

export async function POST() {
  const result = await executeAutomation({
    trigger: "new_lead",
    action: "ai_qualify_lead",

    config: {
      minimumScore: 80,
      notifyOwner: true,
    },

    data: {
      leadId: "test-lead",
      name: "Rahul Sharma",
      message: "I need an ecommerce website.",
    },
  });

  return NextResponse.json(result);
}

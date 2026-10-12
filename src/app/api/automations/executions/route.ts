
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getBusinessForUser } from "@/src/lib/workspace";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const business = await getBusinessForUser(userId);

    if (!business) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 },
      );
    }

    // History becomes available after the database migration
    // and persistence logic are implemented.
    return NextResponse.json({
      success: true,
      executions: [],
      total: 0,
      message: "Execution history is not enabled yet.",
    });
  } catch (error) {
    console.error("GET /api/automations/executions error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load execution history" },
      { status: 500 },
    );
  }
}

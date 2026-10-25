import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerNewUser } from "@/src/lib/auth-db";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Operator or business name is required"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(8, "Access key password must be at least 8 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RegisterSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;
    const user = await registerNewUser({ name, email, password });

    return NextResponse.json(
      {
        success: true,
        message: "Workspace node provisioned successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER_API_ERROR]", error);

    const errorMessage = error?.message || "An unexpected error occurred during node provisioning.";
    const isConflict = errorMessage.toLowerCase().includes("already exists");

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}

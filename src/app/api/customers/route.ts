import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getBusinessForUser } from "@/src/lib/workspace";
import { CreateCustomerSchema } from "@/src/lib/validation";
import { db } from "@/src/prisma/db";

export async function GET() {
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
      return NextResponse.json({
        success: true,
        customers: [],
      });
    }

    const customers = await db.orm.public.Customer
      .where({ businessId: business.id })
      .orderBy((c) => c.createdAt.desc())
      .select(
        "id",
        "businessId",
        "name",
        "email",
        "phone",
        "company",
        "notes",
        "status",
        "createdAt",
        "updatedAt"
      )
      .all();

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const parseResult = CreateCustomerSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid input parameters";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const customer = await db.orm.public.Customer.create({
      id: crypto.randomUUID(),
      businessId: business.id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
      status: data.status || "active",
    });

    return NextResponse.json(
      {
        success: true,
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

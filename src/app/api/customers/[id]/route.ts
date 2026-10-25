import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getBusinessForUser } from "@/src/lib/workspace";
import { UpdateCustomerSchema } from "@/src/lib/validation";
import { db } from "@/src/prisma/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const customer = await db.orm.public.Customer
      .where({
        id,
        businessId: business.id,
      })
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
      .first();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const existing = await db.orm.public.Customer
      .where({
        id,
        businessId: business.id,
      })
      .select("id")
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = UpdateCustomerSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid input parameters";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updateData: Record<string, any> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.company !== undefined) updateData.company = data.company || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.status !== undefined) updateData.status = data.status;

    await db.orm.public.Customer
      .where({ id })
      .update(updateData as any);

    const updated = await db.orm.public.Customer
      .where({ id })
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
      .first();

    return NextResponse.json({
      success: true,
      customer: updated,
    });
  } catch (error) {
    console.error("PATCH /api/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  return PATCH(request, context);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const existing = await db.orm.public.Customer
      .where({
        id,
        businessId: business.id,
      })
      .select("id")
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Customer
      .where({ id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import { getBusinessForUser } from "@/src/lib/workspace";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const business = await getBusinessForUser(session.user.id);

        if (!business) {
            return NextResponse.json({
                success: true,
                conversations: [],
            });
        }

        const conversations = await db.orm.public.Conversation
            .where({
                businessId: business.id,
            })
            .orderBy((c) => c.updatedAt.desc())
            .select(
                "id",
                "channel",
                "status",
                "messages",
                "createdAt",
                "updatedAt"
            )
            .all();

        return NextResponse.json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.error("Conversation History Error:", error);

        return NextResponse.json(
            {
                error: "Failed to load conversations",
            },
            { status: 500 }
        );
    }
}
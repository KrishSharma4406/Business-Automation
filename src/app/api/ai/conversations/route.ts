import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import { getBusinessForUser } from "@/src/lib/workspace";
import { formatConversationQuestion } from "@/src/lib/format-conversation-question";

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

        const formatted = conversations.map((c) => ({
            ...c,
            title: formatConversationQuestion(c as any),
        }));

        return NextResponse.json({
            success: true,
            conversations: formatted,
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

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("id");

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID is required" },
                { status: 400 }
            );
        }

        const business = await getBusinessForUser(session.user.id);

        if (!business) {
            return NextResponse.json(
                { error: "No business found" },
                { status: 404 }
            );
        }

        /* Verify the conversation belongs to this business */
        const conversation = await db.orm.public.Conversation
            .where({
                id: conversationId,
                businessId: business.id,
            })
            .select("id")
            .first();

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        await db.orm.public.Conversation
            .where({ id: conversationId })
            .delete();

        return NextResponse.json({
            success: true,
            message: "Conversation deleted",
        });
    } catch (error) {
        console.error("Delete Conversation Error:", error);

        return NextResponse.json(
            {
                error: "Failed to delete conversation",
            },
            { status: 500 }
        );
    }
}
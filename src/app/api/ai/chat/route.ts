import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import {
    generateAIResponse,
    BusinessContext,
} from "@/src/lib/ai/chat";
import { db } from "@/src/prisma/db";
import {
    getBusinessForUser,
    getWorkspaceForUser,
} from "@/src/lib/workspace";

type MessageItem = {
    role: "user" | "assistant" | "system";
    content: string;
};

/**
 * Fetch live business information that will be supplied
 * to the AI for every request.
 */
async function fetchBusinessContext(
    userId: string,
    businessId: string
): Promise<BusinessContext | undefined> {
    try {
        /*
         * Business information
         */
        const business = await db.orm.public.Business
            .where({ id: businessId })
            .select(
                "name",
                "industry",
                "description",
                "website"
            )
            .first();

        /*
         * Leads
         */
        const leads = await db.orm.public.Lead
            .where({ businessId })
            .orderBy((l) => l.createdAt.desc())
            .select(
                "id",
                "name",
                "email",
                "phone",
                "company",
                "message",
                "source",
                "status",
                "priority",
                "aiScore",
                "aiSummary",
                "createdAt"
            )
            .all();

        /*
         * Customers
         */
        const customers = await db.orm.public.Customer
            .where({ businessId })
            .orderBy((c) => c.createdAt.desc())
            .select(
                "id",
                "name",
                "email",
                "phone",
                "company",
                "status",
                "notes"
            )
            .all();

        /*
         * Automations
         */
        const automations = await db.orm.public.Automation
            .where({ businessId })
            .select(
                "id",
                "name",
                "trigger",
                "action",
                "enabled",
                "description"
            )
            .all();

        /*
         * Integrations belong to the workspace.
         */
        const workspaceMember =
            await getWorkspaceForUser(userId);

        const integrations =
            workspaceMember?.workspaceId
                ? await db.orm.public.Integration
                      .where({
                          workspaceId:
                              workspaceMember.workspaceId,
                      })
                      .select(
                          "provider",
                          "name",
                          "status"
                      )
                      .all()
                : [];

        return {
            business: {
                name:
                    business?.name ||
                    "Main Business",

                industry:
                    business?.industry ||
                    null,

                description:
                    business?.description ||
                    null,

                website:
                    business?.website ||
                    null,
            },

            leads: leads.map((lead) => ({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                message: lead.message,
                source: lead.source,
                status: lead.status,
                priority: lead.priority,
                aiScore: lead.aiScore,
                aiSummary: lead.aiSummary,
                createdAt: lead.createdAt,
            })),

            customers: customers.map((customer) => ({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                status: customer.status,
                notes: customer.notes,
            })),

            automations: automations.map(
                (automation) => ({
                    id: automation.id,
                    name: automation.name,
                    trigger: automation.trigger,
                    action: automation.action,
                    enabled: automation.enabled,
                    description:
                        automation.description,
                })
            ),

            integrations: integrations.map(
                (integration) => ({
                    provider:
                        String(
                            integration.provider
                        ),

                    name: integration.name,

                    status:
                        String(
                            integration.status
                        ),
                })
            ),
        };
    } catch (error) {
        console.error(
            "Error fetching business context:",
            error
        );

        return undefined;
    }
}

/**
 * POST /api/ai/chat
 *
 * Handles:
 * - authentication
 * - business lookup
 * - live business context
 * - existing conversation history
 * - AI response generation
 * - conversation persistence
 */
export async function POST(request: Request) {
    try {
        /*
         * --------------------------------------------------
         * 1. Authenticate user
         * --------------------------------------------------
         */
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * --------------------------------------------------
         * 2. Parse request
         * --------------------------------------------------
         */
        const body = await request.json();

        const {
            conversationId,
            message,
        } = body;

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return NextResponse.json(
                {
                    error: "Message is required",
                },
                {
                    status: 400,
                }
            );
        }

        const cleanMessage = message.trim();

        /*
         * --------------------------------------------------
         * 3. Find user's business
         * --------------------------------------------------
         */
        const business =
            await getBusinessForUser(
                session.user.id
            );

        if (!business) {
            return NextResponse.json(
                {
                    error: "No business found",
                },
                {
                    status: 404,
                }
            );
        }

        const businessId = business.id;

        /*
         * --------------------------------------------------
         * 4. Fetch live business context
         * --------------------------------------------------
         *
         * This gives the AI access to:
         *
         * - business information
         * - leads
         * - customers
         * - automations
         * - integrations
         */
        const context =
            await fetchBusinessContext(
                session.user.id,
                businessId
            );

        /*
         * --------------------------------------------------
         * 5. Existing conversation
         * --------------------------------------------------
         */
        if (conversationId) {
            const existing =
                await db.orm.public.Conversation
                    .where({
                        id: conversationId,
                        businessId,
                    })
                    .select(
                        "id",
                        "messages"
                    )
                    .first();

            if (!existing) {
                return NextResponse.json(
                    {
                        error:
                            "Conversation not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            /*
             * Existing stored messages.
             */
            const rawMessages =
                Array.isArray(
                    existing.messages
                )
                    ? (
                          existing.messages as MessageItem[]
                      )
                    : [];

            /*
             * Normalize history.
             */
            const history: MessageItem[] =
                rawMessages
                    .filter(
                        (item) =>
                            item &&
                            typeof item.content ===
                                "string"
                    )
                    .map((item) => ({
                        role:
                            item.role ===
                                "assistant" ||
                            item.role === "system"
                                ? item.role
                                : "user",

                        content:
                            item.content,
                    }));

            /*
             * Current user message.
             */
            const userMessage: MessageItem = {
                role: "user",
                content: cleanMessage,
            };

            /*
             * Complete conversation sent to AI.
             */
            const aiMessages: MessageItem[] = [
                ...history,
                userMessage,
            ];

            /*
             * --------------------------------------------------
             * 6. Generate AI response
             * --------------------------------------------------
             */
            const answer =
                await generateAIResponse(
                    aiMessages,
                    context
                );

            /*
             * --------------------------------------------------
             * 7. Save updated conversation
             * --------------------------------------------------
             */
            const updatedMessages: MessageItem[] = [
                ...rawMessages,
                userMessage,
                {
                    role: "assistant",
                    content: answer,
                },
            ];

            await db.orm.public.Conversation
                .where({
                    id: existing.id,
                })
                .update({
                    messages:
                        updatedMessages as any,
                });

            /*
             * --------------------------------------------------
             * 8. Return response
             * --------------------------------------------------
             */
            return NextResponse.json({
                success: true,
                conversationId:
                    existing.id,
                message: answer,
            });
        }

        /*
         * --------------------------------------------------
         * 9. New conversation
         * --------------------------------------------------
         */
        const userMessage: MessageItem = {
            role: "user",
            content: cleanMessage,
        };

        /*
         * Generate AI response using
         * live business context.
         */
        const answer =
            await generateAIResponse(
                [userMessage],
                context
            );

        /*
         * Generate conversation ID.
         */
        const newConversationId =
            crypto.randomUUID();

        /*
         * Initial messages.
         */
        const messages: MessageItem[] = [
            userMessage,
            {
                role: "assistant",
                content: answer,
            },
        ];

        /*
         * --------------------------------------------------
         * 10. Save conversation
         * --------------------------------------------------
         */
        await db.orm.public.Conversation.create({
            id: newConversationId,

            businessId,

            channel: "AI",

            status: "open",

            messages: messages as any,
        });

        /*
         * --------------------------------------------------
         * 11. Return response
         * --------------------------------------------------
         */
        return NextResponse.json({
            success: true,
            conversationId:
                newConversationId,
            message: answer,
        });
    } catch (error) {
        console.error(
            "AI Chat Error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to process AI chat",
            },
            {
                status: 500,
            }
        );
    }
}
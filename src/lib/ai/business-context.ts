import { db } from "@/src/prisma/db";

export async function getBusinessContext(workspaceId: string) {
  // Find associated businessId if workspaceId is provided
  let businessId = workspaceId;

  try {
    const workspace = await db.orm.public.Workspace
      .where({ id: workspaceId })
      .first();

    if (workspace) {
      const ownerMember = await db.orm.public.WorkspaceMember
        .where({ workspaceId: workspace.id, role: "OWNER" })
        .first();

      if (ownerMember) {
        const business = await db.orm.public.Business
          .where({ ownerId: ownerMember.userId })
          .first();

        if (business) {
          businessId = business.id;
        }
      }
    }
  } catch (err) {
    console.error("Error resolving workspace/business mapping:", err);
  }

  try {
    const [
      leadsList,
      customersList,
      automationsList,
      integrationsList,
    ] = await Promise.all([
      db.orm.public.Lead
        .where({ businessId })
        .select("id")
        .all(),

      db.orm.public.Customer
        .where({ businessId })
        .select("id")
        .all(),

      db.orm.public.Automation
        .where({ businessId })
        .select("id")
        .all(),

      db.orm.public.Integration
        .where({ workspaceId })
        .select("provider", "status")
        .all(),
    ]);

    return {
      leads: leadsList.length,
      customers: customersList.length,
      automations: automationsList.length,
      integrations: integrationsList.map((i) => ({
        provider: i.provider,
        status: i.status,
      })),
    };
  } catch (err) {
    console.error("Error querying business context:", err);
    return {
      leads: 0,
      customers: 0,
      automations: 0,
      integrations: [],
    };
  }
}
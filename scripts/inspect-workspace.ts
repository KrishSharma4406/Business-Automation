import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

async function main() {
  const users = await db.orm.public.User
    .select("id", "email", "name")
    .all();

  const workspaces = await db.orm.public.Workspace
    .select("id", "name", "slug")
    .all();

  const members = await db.orm.public.WorkspaceMember
    .select("id", "userId", "workspaceId", "role")
    .all();

  console.log("\nUSERS:");
  console.dir(users, { depth: null });

  console.log("\nWORKSPACES:");
  console.dir(workspaces, { depth: null });

  console.log("\nWORKSPACE MEMBERS:");
  console.dir(members, { depth: null });
}

main().catch(console.error);

import "dotenv/config";
import { Temporal } from "temporal-polyfill";

if (typeof (globalThis as any).Temporal === "undefined") {
  (globalThis as any).Temporal = Temporal;
}

import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

async function main() {
  const integrations = await db.orm.public.Integration
    .select(
      "id",
      "workspaceId",
      "provider",
      "name",
      "status"
    )
    .all();

  console.log("INTEGRATIONS:");
  console.dir(integrations, { depth: null });
}

main().catch(console.error);

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
  const id = "b9a1dc2f-2fa4-4d90-a599-bb113a5092e6";

  await db.orm.public.Integration
    .where({ id })
    .delete();

  console.log("Deleted corrupted integration:", id);
}

main().catch(console.error);

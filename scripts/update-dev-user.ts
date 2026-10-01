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
  const user = await db.orm.public.User
    .where({
      id: "8c1a01d1-1f11-42e5-a6d1-a7efc2622633",
    })
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  console.log("Current user:");
  console.dir(user, { depth: null });

  const updated = await db.orm.public.User
    .where({
      id: user.id,
    })
    .update({
      email: "autoleep@gmail.com",
      name: "AutoLeep Admin",
    });

  console.log("\nUpdated user:");
  console.dir(updated, { depth: null });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
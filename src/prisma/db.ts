import "dotenv/config";
import { Temporal } from "temporal-polyfill";

if (typeof (globalThis as any).Temporal === "undefined") {
  (globalThis as any).Temporal = Temporal;
}

import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

const connectionString = rawConnectionString.replace(/^["']|["']$/g, "").trim();

export const db = postgres<Contract>({
  contractJson,
  url: connectionString,
});
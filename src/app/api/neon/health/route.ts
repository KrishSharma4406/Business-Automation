import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { invokeNeonFunction, checkNeonAIGateway, getNeonConfig } from "@/src/lib/neon";

export async function GET() {
  const config = getNeonConfig();
  const results: {
    postgres: { ok: boolean; message: string; durationMs: number };
    functions: { ok: boolean; message: string; response?: string; durationMs: number };
    aiGateway: { ok: boolean; message: string; status: number; durationMs: number };
  } = {
    postgres: { ok: false, message: "Untested", durationMs: 0 },
    functions: { ok: false, message: "Untested", durationMs: 0 },
    aiGateway: { ok: false, message: "Untested", status: 0, durationMs: 0 },
  };

  // 1. Test Lakebase Postgres
  const startDb = Date.now();
  try {
    const userCount = await db.orm.public.User.select("id").all();
    results.postgres = {
      ok: true,
      message: `Connected successfully to Neon Postgres. Found ${userCount.length} users.`,
      durationMs: Date.now() - startDb,
    };
  } catch (err) {
    results.postgres = {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startDb,
    };
  }

  // 2. Test Neon Functions
  const startFn = Date.now();
  try {
    const fnResult = await invokeNeonFunction("hello");
    results.functions = {
      ok: fnResult.ok,
      message: fnResult.ok
        ? "Neon Function responded successfully"
        : `Neon Function returned HTTP ${fnResult.status}`,
      response: fnResult.text.trim(),
      durationMs: Date.now() - startFn,
    };
  } catch (err) {
    results.functions = {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startFn,
    };
  }

  // 3. Test Neon AI Gateway
  const startAi = Date.now();
  try {
    const aiResult = await checkNeonAIGateway();
    results.aiGateway = {
      ok: aiResult.modelCatalogAvailable,
      message: aiResult.message || "Tested",
      status: aiResult.status,
      durationMs: Date.now() - startAi,
    };
  } catch (err) {
    results.aiGateway = {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      status: 500,
      durationMs: Date.now() - startAi,
    };
  }

  const allHealthy = results.postgres.ok && results.functions.ok && results.aiGateway.ok;

  return NextResponse.json({
    success: true,
    branch: config.branch,
    allHealthy,
    services: results,
  });
}

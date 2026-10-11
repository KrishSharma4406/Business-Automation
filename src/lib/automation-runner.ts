import { db } from "@/src/prisma/db";
import { executeAutomation } from "./automation-engine";
import type {
  AutomationAction,
  AutomationConfig,
  AutomationTrigger,
} from "./automation";

type RunAutomationsInput = {
  businessId: string;
  trigger: AutomationTrigger;
  data: Record<string, unknown>;
};

export type AutomationExecutionResult = {
  automationId: string;
  automationName: string;
  success: boolean;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  result?: unknown;
  error?: string;
};

export async function runAutomationsForEvent({
  businessId,
  trigger,
  data,
}: RunAutomationsInput) {
  const automations = await db.orm.public.Automation
    .where({
      businessId,
      trigger,
      enabled: true,
    })
    .select("id", "name", "action", "config")
    .all();

  const results: AutomationExecutionResult[] = await Promise.all(
    automations.map(async (automation) => {
      const startedAt = new Date();
      let execution: AutomationExecutionResult;

      try {
        const result = await executeAutomation({
          trigger,
          action: automation.action as AutomationAction,
          config: (automation.config ?? undefined) as
            | AutomationConfig
            | undefined,
          data,
        });

        execution = {
          automationId: automation.id,
          automationName: automation.name,
          success: result.success,
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt.getTime(),
          result,
        };
      } catch (error) {
        execution = {
          automationId: automation.id,
          automationName: automation.name,
          success: false,
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt.getTime(),
          error:
            error instanceof Error
              ? error.message
              : "Automation execution failed.",
        };

        console.error(
          `Automation "${automation.name}" failed:`,
          error
        );
      }

      console.log("[Automation Execution]", execution);
      return execution;
    })
  );

  return {
    trigger,
    total: results.length,
    succeeded: results.filter((item) => item.success).length,
    failed: results.filter((item) => !item.success).length,
    results,
  };
}

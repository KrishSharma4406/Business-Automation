
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

export type AutomationRunSummary = {
  businessId: string;
  trigger: AutomationTrigger;
  total: number;
  succeeded: number;
  failed: number;
  results: AutomationExecutionResult[];
};

export async function runAutomationsForEvent({
  businessId,
  trigger,
  data,
}: RunAutomationsInput): Promise<AutomationRunSummary> {
  const automations = await db.orm.public.Automation
    .where({
      businessId,
      trigger,
      enabled: true,
    })
    .select("id", "name", "action", "config")
    .all();

  const results = await Promise.all(
    automations.map(async (automation): Promise<AutomationExecutionResult> => {
      const startTime = Date.now();
      const startedAt = new Date(startTime).toISOString();

      try {
        const result = await executeAutomation({
          trigger,
          action: automation.action as AutomationAction,
          config: (automation.config ?? undefined) as
            | AutomationConfig
            | undefined,
          data,
        });

        const completedTime = Date.now();
        const completedAt = new Date(completedTime).toISOString();

        const error =
          !result.success
            ? "message" in result && typeof result.message === "string"
              ? result.message
              : "Automation action failed."
            : undefined;

        const execution: AutomationExecutionResult = {
          automationId: automation.id,
          automationName: automation.name,
          success: result.success,
          startedAt,
          completedAt,
          durationMs: completedTime - startTime,
          result,
          ...(error ? { error } : {}),
        };

        if (execution.success) {
          console.info(
            `[Automation Execution Succeeded] ${automation.name}`,
            execution
          );
        } else {
          console.error(
            `[Automation Execution Failed] ${automation.name}`,
            execution
          );
        }

        return execution;
      } catch (error) {
        const completedTime = Date.now();

        const execution: AutomationExecutionResult = {
          automationId: automation.id,
          automationName: automation.name,
          success: false,
          startedAt,
          completedAt: new Date(completedTime).toISOString(),
          durationMs: completedTime - startTime,
          error:
            error instanceof Error
              ? error.message
              : "Automation execution failed.",
        };

        console.error(
          `[Automation Execution Failed] ${automation.name}`,
          execution
        );

        return execution;
      }
    })
  );

  return {
    businessId,
    trigger,
    total: results.length,
    succeeded: results.filter((item) => item.success).length,
    failed: results.filter((item) => !item.success).length,
    results,
  };
}

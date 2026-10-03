import type {
  AutomationAction,
  AutomationConfig,
  AutomationTrigger,
} from "./automation";

import { qualifyLead } from "./ai/lead-qualification";

type AutomationInput = {
  trigger: AutomationTrigger;
  action: AutomationAction;
  config?: AutomationConfig;
  data: any;
};

export async function executeAutomation(
  input: AutomationInput
) {
  switch (input.action) {
    case "ai_qualify_lead": {
      const result = await qualifyLead({
        name: input.data.name,
        email: input.data.email,
        company: input.data.company,
        message: input.data.message,
      });

      const minimumScore =
        input.config?.minimumScore ?? 0;

      const meetsThreshold =
        result.score >= minimumScore;

      const sideEffects: string[] = [];

      if (
        input.config?.notifyOwner &&
        meetsThreshold
      ) {
        sideEffects.push(
          "Owner notification queued."
        );
      }

      return {
        success: true,
        action: input.action,
        meetsThreshold,
        minimumScore,
        sideEffects,
        result,
      };
    }

    case "generate_response":
      return {
        success: true,
        message: "Response generation queued.",
      };

    case "send_email":
      return {
        success: true,
        message: "Email sending queued.",
      };

    case "send_whatsapp":
      return {
        success: true,
        message: "WhatsApp message queued.",
      };

    case "notify_owner":
      return {
        success: true,
        message: "Owner notification queued.",
      };

    case "create_task":
      return {
        success: true,
        message: "Task creation queued.",
      };

    default:
      throw new Error(
        `Unsupported automation action: ${input.action}`
      );
  }
}

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
  data: Record<string, any>;
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

    case "generate_response": {
      const result = await qualifyLead({
        name: input.data.name,
        email: input.data.email,
        company: input.data.company,
        message: input.data.message,
      });

      return {
        success: true,
        action: input.action,
        response: result.response,
      };
    }

    case "send_email":
      return {
        success: false,
        action: input.action,
        message:
          "Email provider is not configured. No email was sent.",
      };

    case "send_whatsapp":
      return {
        success: false,
        action: input.action,
        message:
          "WhatsApp provider is not configured. No message was sent.",
      };

    case "notify_owner":
      return {
        success: false,
        action: input.action,
        message:
          "Owner notification delivery is not configured.",
      };

    case "create_task":
      return {
        success: false,
        action: input.action,
        message:
          "Task persistence is not implemented yet. No task was created.",
      };

    default:
      throw new Error(
        `Unsupported automation action: ${input.action}`
      );
  }
}
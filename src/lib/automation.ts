export type AutomationTrigger =
  | "new_lead"
  | "new_customer"
  | "new_message"
  | "lead_qualified"
  | "conversation_received";

export type AutomationAction =
  | "ai_qualify_lead"
  | "generate_response"
  | "send_email"
  | "send_whatsapp"
  | "notify_owner"
  | "create_task";

export type AutomationConfig = {
  minimumScore?: number;
  notifyOwner?: boolean;
  sendResponse?: boolean;
  channel?: string;
  template?: string;
};
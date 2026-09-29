export const integrationProviders = {
  GROK: {
    name: "Grok",
    description: "AI and automation",
  },

  GOOGLE: {
    name: "Google",
    description: "Google Workspace",
  },

  GMAIL: {
    name: "Gmail",
    description: "Email automation",
  },

  SLACK: {
    name: "Slack",
    description: "Team communication",
  },

  WHATSAPP: {
    name: "WhatsApp",
    description: "Customer communication",
  },

  STRIPE: {
    name: "Stripe",
    description: "Payments",
  },
} as const;

export type IntegrationProvider =
  keyof typeof integrationProviders;
import { z } from "zod";

export const integrationProviderSchema = z.enum([
  "GROK",
  "GOOGLE",
  "GMAIL",
  "SLACK",
  "WHATSAPP",
  "STRIPE",
]);

export const integrationStatusSchema = z.enum([
  "CONNECTED",
  "DISCONNECTED",
  "ERROR",
]);

export const createIntegrationSchema = z.object({
  provider: integrationProviderSchema,

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),

  credentials: z
    .record(z.string(), z.string())
    .refine(
      (credentials) =>
        Object.keys(credentials).length > 0,
      {
        message: "Credentials are required",
      }
    ),

  metadata: z
    .record(z.string(), z.any())
    .optional(),
});

export const updateIntegrationSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  status: integrationStatusSchema.optional(),

  credentials: z
    .record(z.string(), z.string())
    .optional(),

  metadata: z
    .record(z.string(), z.any())
    .optional(),
});
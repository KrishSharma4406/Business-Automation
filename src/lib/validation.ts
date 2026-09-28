import { z } from "zod";

export const CreateLeadSchema = z.object({
  businessId: z.string().uuid(),

  name: z.string().min(2),

  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),

  phone: z.string().optional(),

  company: z.string().optional(),

  message: z.string().optional(),

  source: z.string().optional(),
});

export type CreateLeadInput = z.infer<
  typeof CreateLeadSchema
>;
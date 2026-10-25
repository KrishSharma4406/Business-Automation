import { z } from "zod";

export const CreateLeadSchema = z.object({
  businessId: z.string().uuid().optional(),

  name: z.string().min(2, "Name must be at least 2 characters"),

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

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  phone: z.string().optional().or(z.literal("")),

  company: z.string().optional().or(z.literal("")),

  notes: z.string().optional().or(z.literal("")),

  status: z.string().optional().default("active"),
});

export type CreateCustomerInput = z.infer<
  typeof CreateCustomerSchema
>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<
  typeof UpdateCustomerSchema
>;
import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number looks short").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  providerId: z.string().min(1, "Provider is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type PatientSchema = z.infer<typeof patientSchema>;

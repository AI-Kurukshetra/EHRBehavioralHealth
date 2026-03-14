import { z } from "zod";

export const treatmentPlanSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Patient is required"),
  providerId: z.string().min(1, "Provider is required"),
  title: z.string().min(3),
  goals: z.string().min(3),
  interventions: z.string().min(3),
  status: z.enum(["active", "paused", "completed"]).default("active"),
  reviewDate: z.string().optional().or(z.literal("")),
});

export type TreatmentPlanSchema = z.infer<typeof treatmentPlanSchema>;

import { z } from "zod";

export const appointmentSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Patient is required"),
  providerId: z.string().min(1, "Provider is required"),
  scheduledAt: z.string().min(1, "Schedule date is required"),
  durationMinutes: z.coerce.number().min(15).max(180).default(50),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  location: z.string().default("Virtual"),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentSchema = z.infer<typeof appointmentSchema>;

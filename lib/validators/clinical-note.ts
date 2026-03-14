import { z } from "zod";

export const clinicalNoteSchema = z.object({
  id: z.string().optional(),
  appointmentId: z.string().min(1, "Appointment is required"),
  patientId: z.string().min(1, "Patient is required"),
  providerId: z.string().min(1, "Provider is required"),
  title: z.string().min(3),
  summary: z.string().optional().or(z.literal("")),
  content: z.string().min(10),
  visibility: z.enum(["provider", "patient"]).default("provider"),
});

export type ClinicalNoteSchema = z.infer<typeof clinicalNoteSchema>;

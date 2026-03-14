import type { Appointment, ClinicalNote, Patient, TreatmentPlan } from "@/types/ehr";

const now = new Date();
const iso = (date: Date) => date.toISOString();

export const placeholderPatients: Patient[] = [
  {
    id: "patient-001",
    fullName: "Jordan Diaz",
    email: "jordan@example.com",
    phone: "+1 (555) 123-4455",
    dateOfBirth: "1990-05-14",
    providerId: "provider-001",
    status: "active",
    createdAt: iso(new Date(now.getTime() - 86400000 * 30)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 3)),
  },
  {
    id: "patient-002",
    fullName: "Morgan Patel",
    email: "morgan@example.com",
    phone: "+1 (555) 987-3322",
    dateOfBirth: "1985-11-02",
    providerId: "provider-001",
    status: "active",
    createdAt: iso(new Date(now.getTime() - 86400000 * 60)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 1)),
  },
  {
    id: "patient-003",
    fullName: "Parker Lin",
    email: "parker@example.com",
    phone: "+1 (555) 887-2011",
    dateOfBirth: "1997-03-22",
    providerId: "provider-002",
    status: "inactive",
    createdAt: iso(new Date(now.getTime() - 86400000 * 120)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 12)),
  },
];

export const placeholderAppointments: Appointment[] = [
  {
    id: "appt-001",
    patientId: "patient-001",
    providerId: "provider-001",
    scheduledAt: iso(new Date(now.getTime() + 3600000 * 4)),
    durationMinutes: 50,
    status: "scheduled",
    location: "Virtual",
    notes: "Focus on grounding exercises",
    createdAt: iso(new Date(now.getTime() - 86400000 * 10)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 1)),
  },
  {
    id: "appt-002",
    patientId: "patient-002",
    providerId: "provider-001",
    scheduledAt: iso(new Date(now.getTime() + 3600000 * 8)),
    durationMinutes: 50,
    status: "scheduled",
    location: "In-person",
    notes: "Medication follow up",
    createdAt: iso(new Date(now.getTime() - 86400000 * 5)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 1)),
  },
  {
    id: "appt-003",
    patientId: "patient-003",
    providerId: "provider-002",
    scheduledAt: iso(new Date(now.getTime() + 3600000 * 24)),
    durationMinutes: 50,
    status: "completed",
    location: "Virtual",
    notes: "Initial intake",
    createdAt: iso(new Date(now.getTime() - 86400000 * 1)),
    updatedAt: iso(new Date(now.getTime() - 3600000 * 2)),
  },
];

export const placeholderNotes: ClinicalNote[] = [
  {
    id: "note-001",
    appointmentId: "appt-001",
    patientId: "patient-001",
    providerId: "provider-001",
    title: "Session 8 Progress",
    summary: "Anxiety symptoms trending down",
    content: "Focused on grounding exercises and reframing cognitive distortions.",
    visibility: "provider",
    createdAt: iso(new Date(now.getTime() - 3600000 * 30)),
    updatedAt: iso(new Date(now.getTime() - 3600000 * 30)),
  },
  {
    id: "note-002",
    appointmentId: "appt-002",
    patientId: "patient-002",
    providerId: "provider-001",
    title: "Medication Check",
    summary: "PHQ-9 improving",
    content: "Reviewed medication adherence and side effects.",
    visibility: "provider",
    createdAt: iso(new Date(now.getTime() - 3600000 * 15)),
    updatedAt: iso(new Date(now.getTime() - 3600000 * 15)),
  },
];

export const placeholderTreatmentPlans: TreatmentPlan[] = [
  {
    id: "plan-001",
    patientId: "patient-001",
    providerId: "provider-001",
    title: "CBT for GAD",
    goals: "Reduce GAD-7 to <5 within 12 weeks",
    interventions: "Weekly CBT sessions, mindfulness homework",
    reviewDate: iso(new Date(now.getTime() + 86400000 * 21)),
    status: "active",
    createdAt: iso(new Date(now.getTime() - 86400000 * 21)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 3)),
  },
  {
    id: "plan-002",
    patientId: "patient-002",
    providerId: "provider-001",
    title: "Medication Management",
    goals: "Stabilize mood and improve sleep",
    interventions: "Medication titration, sleep hygiene plan",
    reviewDate: iso(new Date(now.getTime() + 86400000 * 30)),
    status: "active",
    createdAt: iso(new Date(now.getTime() - 86400000 * 45)),
    updatedAt: iso(new Date(now.getTime() - 86400000 * 2)),
  },
];

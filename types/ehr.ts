
export type Patient = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  providerId: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  providerId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClinicalNote = {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  title: string;
  summary?: string;
  content: string;
  visibility: "provider" | "patient";
  createdAt: string;
  updatedAt: string;
};

export type TreatmentPlan = {
  id: string;
  patientId: string;
  providerId: string;
  title: string;
  goals: string;
  interventions: string;
  reviewDate?: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type Provider = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientFormInput = Pick<Patient, "fullName" | "email" | "phone" | "dateOfBirth" | "providerId"> & {
  status?: Patient["status"];
};

export type AppointmentFormInput = Pick<Appointment, "patientId" | "providerId" | "scheduledAt" | "durationMinutes" | "location"> & {
  status?: Appointment["status"];
  notes?: string;
};

export type ClinicalNoteFormInput = Pick<ClinicalNote, "appointmentId" | "patientId" | "providerId" | "title" | "content"> & {
  summary?: string;
  visibility?: ClinicalNote["visibility"];
};

export type TreatmentPlanFormInput = Pick<
  TreatmentPlan,
  "patientId" | "providerId" | "title" | "goals" | "interventions"
> & {
  status?: TreatmentPlan["status"];
  reviewDate?: string;
};

export type ProviderFormInput = Pick<Provider, "fullName" | "email" | "phone" | "specialty">;

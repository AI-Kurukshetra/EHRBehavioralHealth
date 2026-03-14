import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppointments, getClinicalNotes } from "@/lib/data/ehr";
import { createNoteAction, deleteNoteAction } from "./actions";

export default async function NotesPage() {
  const [notes, appointments] = await Promise.all([getClinicalNotes(), getAppointments()]);
  const appointmentLookup = Object.fromEntries(appointments.map((appt) => [appt.id, appt]));

  return (
    <DashboardShell title="Notes" subtitle="Track progress notes and tasks">
      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} title={`${note.title} • ${note.visibility === "patient" ? "Shared" : "Internal"}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {new Date(note.createdAt).toLocaleString()} • {appointmentLookup[note.appointmentId]?.location ?? "Appointment"}
            </p>
            <p className="mt-2 text-slate-600">{note.summary ?? note.content}</p>
            <form action={deleteNoteAction} className="mt-2">
              <input type="hidden" name="id" value={note.id} />
              <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                Delete
              </Button>
            </form>
          </Card>
        ))}
      </div>
      <Card title="Add note">
        <form action={createNoteAction} className="grid gap-3">
          <label className="text-sm font-medium text-slate-600">
            Appointment ID
            <input
              name="appointmentId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="appt-001"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Patient ID
            <input
              name="patientId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="patient-001"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Provider ID
            <input
              name="providerId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="provider-001"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Title
            <input
              name="title"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Session summary"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Summary
            <input
              name="summary"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Short summary"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Content
            <textarea
              name="content"
              rows={4}
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              placeholder="Detailed note"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Visibility
            <select
              name="visibility"
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
            >
              <option value="provider">Provider only</option>
              <option value="patient">Share with patient</option>
            </select>
          </label>
          <Button type="submit">Save note</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}

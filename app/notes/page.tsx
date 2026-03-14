import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAppointments,
  getClinicalNotes,
  getCurrentUserContext,
  getPatients,
  getProviders,
  scopePatientsToCurrentProvider,
  scopeRecordsToCurrentProvider,
} from "@/lib/data/ehr";
import { createNoteAction, deleteNoteAction, updateNoteAction } from "./actions";

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { role, userId } = await getCurrentUserContext();
  const [notes, appointments, patients, providers] = await Promise.all([
    getClinicalNotes(),
    getAppointments(),
    getPatients(),
    getProviders(),
  ]);
  const scopedNotes = await scopeRecordsToCurrentProvider(notes);
  const scopedAppointments = await scopeRecordsToCurrentProvider(appointments);
  const scopedPatients = await scopePatientsToCurrentProvider(patients);
  const availableProviders = role === "provider" && userId ? providers.filter((provider) => provider.id === userId) : providers;
  const appointmentLookup = Object.fromEntries(scopedAppointments.map((appt) => [appt.id, appt]));
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error ? decodeURIComponent(resolvedSearchParams.error) : null;
  const successMessage =
    resolvedSearchParams?.success === "updated"
      ? "Note updated successfully."
      : resolvedSearchParams?.success === "deleted"
        ? "Note deleted successfully."
        : resolvedSearchParams?.success
          ? "Note saved successfully."
          : null;

  return (
    <DashboardShell title="Notes" subtitle="Track progress notes and tasks">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      <div className="grid gap-4">
        {scopedNotes.map((note) => (
          <Card key={note.id} title={`${note.title} • ${note.visibility === "patient" ? "Shared" : "Internal"}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {new Date(note.createdAt).toLocaleString()} • {appointmentLookup[note.appointmentId]?.location ?? "Appointment"}
            </p>
            <p className="mt-2 text-slate-600">{note.summary ?? note.content}</p>
            <form action={deleteNoteAction} className="mt-2">
              <input type="hidden" name="id" value={note.id} />
              <input type="hidden" name="redirectTo" value="/notes" />
              <Button type="submit" variant="secondary" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                Delete
              </Button>
            </form>
          </Card>
        ))}
      </div>
      <Card title="Edit note">
        {scopedNotes.length === 0 ? (
          <p className="text-sm text-slate-500">Create a note first to revise it.</p>
        ) : (
          <div className="space-y-4">
            {scopedNotes.map((note) => (
              <details key={`${note.id}-edit`} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  <span>{note.title}</span>
                  <span className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                </summary>
                <form action={updateNoteAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="id" value={note.id} />
                  <input type="hidden" name="patientId" value={note.patientId} />
                  <input type="hidden" name="appointmentId" value={note.appointmentId} />
                  <input type="hidden" name="redirectTo" value="/notes" />
                  {role === "provider" ? <input type="hidden" name="providerId" value={userId ?? ""} /> : null}
                  {role !== "provider" ? (
                    <label className="text-sm font-medium text-slate-600">
                      Provider
                      <select
                        name="providerId"
                        defaultValue={note.providerId}
                        className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                        required
                      >
                        {availableProviders.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.fullName}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <label className="text-sm font-medium text-slate-600">
                    Title
                    <input
                      name="title"
                      defaultValue={note.title}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Summary
                    <input
                      name="summary"
                      defaultValue={note.summary ?? ""}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                      placeholder="Leave blank to let AI generate one from the note content"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Content
                    <textarea
                      name="content"
                      rows={4}
                      defaultValue={note.content}
                      required
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Visibility
                    <select
                      name="visibility"
                      defaultValue={note.visibility}
                      className="mt-1 w-full rounded-2xl border border-white/60 bg-white px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="provider">Provider only</option>
                      <option value="patient">Share with patient</option>
                    </select>
                  </label>
                  <Button type="submit">Save note changes</Button>
                </form>
              </details>
            ))}
          </div>
        )}
      </Card>
      <Card title="Add note">
        <p className="mb-3 text-sm text-slate-500">
          If you leave the summary blank, the app will try to generate a concise AI summary from the note content using Groq.
        </p>
        <form action={createNoteAction} className="grid gap-3">
          <input type="hidden" name="redirectTo" value="/notes" />
          <label className="text-sm font-medium text-slate-600">
            Appointment
            <select
              name="appointmentId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              defaultValue={scopedAppointments[0]?.id ?? ""}
              disabled={scopedAppointments.length === 0}
            >
              {scopedAppointments.length === 0 ? (
                <option value="">No appointments available</option>
              ) : (
                scopedAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {new Date(appointment.scheduledAt).toLocaleString()} • {appointment.location}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Patient
            <select
              name="patientId"
              required
              className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
              defaultValue={scopedPatients[0]?.id ?? ""}
              disabled={scopedPatients.length === 0}
            >
              {scopedPatients.length === 0 ? (
                <option value="">No patients available</option>
              ) : (
                scopedPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))
              )}
            </select>
          </label>
          {role === "provider" ? <input type="hidden" name="providerId" value={userId ?? ""} /> : null}
          {role !== "provider" ? (
            <label className="text-sm font-medium text-slate-600">
              Provider
              <select
                name="providerId"
                required
                className="mt-1 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow focus:ring-2 focus:ring-indigo-100"
                defaultValue={availableProviders[0]?.id ?? ""}
                disabled={availableProviders.length === 0}
              >
                {availableProviders.length === 0 ? (
                  <option value="">No providers available</option>
                ) : (
                  availableProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.fullName}
                    </option>
                  ))
                )}
              </select>
            </label>
          ) : (
            <label className="text-sm font-medium text-slate-600">
              Provider
              <input
                value="Assigned to your account"
                disabled
                className="mt-1 w-full rounded-2xl border border-white/60 bg-slate-50 px-3 py-2 text-slate-500 shadow"
              />
            </label>
          )}
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

import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layout/main-nav";
import { signOut } from "@/app/actions/logout";
import { getAppointments, getClinicalNotes, getPatients, getTreatmentPlans, getUserIdFromCookies } from "@/lib/data/ehr";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const preferredName = decodeURIComponent(cookieStore.get("bh_full_name")?.value ?? "Patient");
  const userId = await getUserIdFromCookies();
  const patientRecords = await getPatients();
  const patient = patientRecords.find((record) => record.id === userId) ?? patientRecords[0];
  const patientPlans = (await getTreatmentPlans()).filter((plan) => plan.patientId === patient.id);
  const patientNotes = (await getClinicalNotes()).filter((note) => note.patientId === patient.id);
  const patientAppointments = (await getAppointments()).filter((appt) => appt.patientId === patient.id);
  const upcoming = patientAppointments.filter((appt) => new Date(appt.scheduledAt) > new Date());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_45%),_rgb(243,246,255)] px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="glass-panel flex flex-col gap-3 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Patient portal</p>
              <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {preferredName.split(" ")[0]}</h1>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="ghost" className="text-rose-600 hover:text-rose-700">
                Sign out
              </Button>
            </form>
          </div>
          <MainNav />
          <p className="mt-2 text-slate-600">
            Track upcoming appointments, treatment objectives, and provider notes from a single view.
          </p>
        </div>
        <Card title="Next Appointment" value={upcoming[0]?.scheduledAt ? new Date(upcoming[0].scheduledAt).toLocaleString() : "Unscheduled"}>
          Location: {upcoming[0]?.location ?? "Virtual"}
        </Card>
        <Card title="Treatment Plan" value={patientPlans[0]?.title ?? "Pending"}>
          {patientPlans[0]?.goals ?? "Your provider will share an updated plan soon."}
        </Card>
        <Card title="Recent Note" value={patientNotes[0]?.title ?? "No notes yet"}>
          {patientNotes[0]?.summary ?? patientNotes[0]?.content ?? "Once a session is completed, a note summary will appear here."}
        </Card>
      </div>
    </div>
  );
}

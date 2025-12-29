import { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { publicEnv } from "@/lib/env";
import { AdminAppointmentsClient } from "@/components/admin/AdminAppointmentsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AppointmentRecord } from "@/types";

export const metadata: Metadata = {
  title: "Admin : Appointments",
  description: "Manage appointment requests.",
};

export const dynamic = "force-dynamic";

async function getAppointments(): Promise<AppointmentRecord[]> {
  const supabase = getSupabaseAdminClient();
  const woredaId = publicEnv.NEXT_PUBLIC_WOREDA_ID;

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("woreda_id", woredaId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }

  return (data || []) as AppointmentRecord[];
}

export default async function AdminAppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <AdminPageHeader
        icon="requests"
        titleKey="appointments"
        descriptionKey="appointmentsDescription"
        gradient="from-purple-600 via-pink-600 to-rose-600"
      />
      <AdminAppointmentsClient appointments={appointments} />
    </div>
  );
}


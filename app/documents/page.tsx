import Link from "next/link";
import { HiLockClosed, HiQrCode, HiClock } from "react-icons/hi2";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";
import { publicEnv } from "@/lib/env";
import { DocumentsByCategory } from "@/components/DocumentsByCategory";
import { getTranslations } from "next-intl/server";

const hasSupabaseServerConfig = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const metadata = {
  title: "Documents • Temporary Access",
  description:
    "View official category documents after receiving temporary access approval.",
};

export const dynamic = "force-dynamic";


interface DocumentsPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;
  const t = await getTranslations('common');

  if (!hasSupabaseServerConfig) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <HiLockClosed className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Configuration Error
          </h1>
          <p className="text-slate-600 mb-6">
            The secure document feed requires server-side Supabase credentials.
            Please check your environment configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!params.token) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-[40px] bg-white p-10 shadow-2xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
            <HiLockClosed className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Restricted Access
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            This portal is restricted to approved temporary users. Please start
            the access flow via your QR code.
          </p>
          <Link
            href="/request-access"
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
          >
            <HiQrCode className="h-5 w-5" />
            Request Access
          </Link>
        </div>
      </div>
    );
  }

  const accessRecord = await validateTemporaryAccess(params.token);

  if (!accessRecord) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-[40px] bg-white p-10 shadow-2xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
            <HiClock className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Access Expired
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            The temporary token appears to have expired. Please request a fresh
            QR approval from your administrator.
          </p>
          <Link
            href="/request-access"
            className="inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
          >
            Request New Access
          </Link>
        </div>
      </div>
    );
  }

  const documents = await getDocumentsForWoreda(accessRecord.woreda_id);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="mx-auto max-w-7xl flex flex-col gap-8 p-4 py-12 lg:py-20">
        <div className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 shadow-2xl lg:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <HiLockClosed className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-1">
                  {t('authorizedReader')}
                </p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">
                  {t('temporaryAccessTitle')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md border border-white/10">
              <HiClock className="h-5 w-5 text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-100">
                Valid until {new Date(accessRecord.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <DocumentsByCategory documents={documents} accessToken={params.token} />
      </main>
    </div>
  );
}


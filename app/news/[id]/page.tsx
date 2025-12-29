import { getNewsItem } from "@/lib/news";
import Image from "next/image";
import { SupabaseImage } from "@/components/SupabaseImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft, HiCalendar, HiUser } from "react-icons/hi2";
import { format } from "date-fns";
import { Footer } from "@/components/Footer";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const newsItem = await getNewsItem(id);

    if (!newsItem) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar Minimal */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="font-bold text-slate-900 truncate max-w-xs md:max-w-md hidden md:block">
                        {publicEnv.NEXT_PUBLIC_WOREDA_NAME}
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-16">
                <article className="max-w-4xl mx-auto px-4 md:px-6">
                    {/* Header */}
                    <header className="mb-10 text-center space-y-6">
                        {/* Meta */}
                        <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <HiCalendar className="w-4 h-4 text-blue-500" />
                                {newsItem.published_at ? format(new Date(newsItem.published_at), "MMMM d, yyyy") : "Draft"}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <HiUser className="w-4 h-4 text-purple-500" />
                                Admin
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            {newsItem.title}
                        </h1>

                        {newsItem.summary && (
                            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                {newsItem.summary}
                            </p>
                        )}
                    </header>

                    {/* Featured Image */}
                    {newsItem.cover_image_url && (
                        <div className="relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-12">
                            <SupabaseImage
                                src={newsItem.cover_image_url}
                                alt={newsItem.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-slate md:prose-xl mx-auto
             prose-headings:font-bold prose-headings:text-slate-900
             prose-p:text-slate-700 prose-p:leading-8
             prose-a:text-blue-600 hover:prose-a:text-blue-500
             prose-img:rounded-2xl prose-img:shadow-lg
           ">
                        {newsItem.content.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </article>
            </main>

            <Footer woredaName={publicEnv.NEXT_PUBLIC_WOREDA_NAME} />
        </div>
    );
}

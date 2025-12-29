import { getNews } from "@/lib/news";
import Link from "next/link";
import Image from "next/image";
import { HiArrowRight, HiCalendar, HiNewspaper } from "react-icons/hi2";
import { format } from "date-fns";
import { cookies } from "next/headers";
import { getTranslations } from 'next-intl/server';

export async function NewsSection() {
    const news = await getNews(6);
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
    const t = await getTranslations('newsSection');

    if (news.length === 0) {
        return null;
    }

    // Helper to get localized text with fallback
    const getLocalizedText = (item: any, field: 'title' | 'summary' | 'content') => {
        if (locale === 'am') {
            return item[`${field}_am`] || item[field];
        }
        if (locale === 'or') {
            return item[`${field}_or`] || item[field];
        }
        return item[field];
    };

    return (
        <section id="news" className="relative py-24 overflow-hidden">
            {/* Branded background using hero image with soft overlay */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/herobg.png"
                    alt="Background"
                    fill
                    className="object-cover object-center opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white/95" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>
                        {t('badge')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        {t('title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{t('titleHighlight')}</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div
                    className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [scroll-behavior:smooth]"
                >
                    {news.map((item) => {
                        const title = getLocalizedText(item, 'title');
                        const summary = getLocalizedText(item, 'summary');
                        const content = getLocalizedText(item, 'content');

                        return (
                            <Link
                                key={item.id}
                                href={`/news/${item.id}`}
                                className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 min-w-[280px] max-w-sm flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_33%] snap-start"
                            >
                                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                                    {/* Prefer explicit cover image; if missing but YouTube URL exists, use its thumbnail */}
                                    {(() => {
                                        const getYoutubeThumbnailUrl = (url: string | undefined): string | null => {
                                            if (!url) return null;
                                            try {
                                                const u = new URL(url);
                                                if (u.hostname.includes("youtu.be")) {
                                                    const id = u.pathname.split("/").filter(Boolean)[0];
                                                    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
                                                }
                                                if (u.hostname.includes("youtube.com")) {
                                                    const v = u.searchParams.get("v");
                                                    if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
                                                    if (u.pathname.startsWith("/embed/")) {
                                                        const id = u.pathname.split("/").filter(Boolean)[1];
                                                        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
                                                    }
                                                }
                                                return null;
                                            } catch {
                                                return null;
                                            }
                                        };

                                        const thumb = item.cover_image_url || getYoutubeThumbnailUrl(item.youtube_url);

                                        if (thumb) {
                                            return (
                                                <Image
                                                    src={thumb}
                                                    alt={title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            );
                                        }

                                        return (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <HiNewspaper className="w-16 h-16" />
                                            </div>
                                        );
                                    })()}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                                        <HiCalendar className="w-3.5 h-3.5 text-blue-600" />
                                        {item.published_at ? format(new Date(item.published_at), "MMM d, yyyy") : t('draft')}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 md:p-8 flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {title}
                                    </h3>
                                    <p className="text-slate-600 mb-6 line-clamp-3 flex-1 text-sm leading-relaxed">
                                        {summary || content}
                                    </p>

                                    <div className="flex items-center mt-auto gap-2 text-sm font-bold text-blue-600 group/btn">
                                        {t('readArticle')}
                                        <HiArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}

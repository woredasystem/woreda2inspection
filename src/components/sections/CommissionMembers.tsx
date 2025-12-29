"use client";

import Image from "next/image";
import { SupabaseImage } from "@/components/SupabaseImage";
import { motion } from "framer-motion";
import { LeaderRecord } from "@/types";
import { HiUser, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useTranslations, useLocale } from 'next-intl';

interface CommissionMembersProps {
    categories: {
        id: string;
        leaders: LeaderRecord[];
    }[];
}

export function CommissionMembers({ categories }: CommissionMembersProps) {
    const t = useTranslations();
    const locale = useLocale();

    // Map category IDs to translation keys
    const getCategoryTitle = (categoryId: string) => {
        const titleMap: Record<string, string> = {
            "commission-committee": t('leaders.commissionCommittee'),
            "management": t('leaders.managementMembers'),
            "work-leadership": t('leaders.workLeadership'),
            "monitoring-committees": t('leaders.monitoringCommittees'),
        };
        return titleMap[categoryId] || categoryId;
    };

    // Localization helpers
    const getName = (leader: LeaderRecord) => {
        if (locale === 'am') return leader.name_am || leader.name;
        if (locale === 'or') return leader.name_or || leader.name;
        return leader.name;
    };

    const getTitle = (leader: LeaderRecord) => {
        if (locale === 'am') return leader.title_am || leader.title;
        if (locale === 'or') return leader.title_or || leader.title;
        return leader.title;
    };

    const scrollSlider = (id: string, direction: "left" | "right") => {
        const slider = document.getElementById(id);
        if (slider) {
            const scrollAmount = slider.clientWidth * 0.8;
            slider.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Filter out empty categories
    const activeCategories = categories.filter(c => c.leaders.length > 0);

    return (
        <section id="members" className="relative py-12 md:py-24 space-y-20 scroll-mt-32 overflow-hidden">
            {/* Branded background reusing hero image behind members */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/herobg.png"
                    alt="Background"
                    fill
                    className="object-cover object-left opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white" />
            </div>
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                        {t('leaders.membersSubtitle')}
                    </h2>
                </div>

                <div className="space-y-16">
                    {activeCategories.map((category, catIdx) => (
                        <div key={category.id} className="space-y-6">
                            <div className="flex items-center gap-4 px-4">
                                <div className="h-10 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{getCategoryTitle(category.id)}</h3>
                                    {category.id === "commission-committee" && (
                                        <p className="text-sm text-slate-500 mt-1">{t('leaders.commissionCommitteeCount')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Slider Container */}
                            <div className="relative group">
                                {/* Navigation Buttons */}
                                <button
                                    onClick={() => scrollSlider(`slider-${category.id}`, "left")}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/20 opacity-0 group-hover:opacity-100"
                                    aria-label="Scroll left"
                                >
                                    <HiChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => scrollSlider(`slider-${category.id}`, "right")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/20 opacity-0 group-hover:opacity-100"
                                    aria-label="Scroll right"
                                >
                                    <HiChevronRight className="h-6 w-6" />
                                </button>

                                {/* Scrollable Area */}
                                <div
                                    id={`slider-${category.id}`}
                                    className="flex overflow-x-auto pb-8 pt-4 gap-6 px-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
                                >
                                    {category.leaders.map((leader, idx) => (
                                        <motion.div
                                            key={leader.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex-none w-72 snap-center"
                                        >
                                            <div className="group/card relative overflow-hidden rounded-3xl bg-white p-4 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl border border-slate-100 h-full">
                                                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 mb-4">
                                                    {leader.photo_url ? (
                                                        <SupabaseImage
                                                            src={leader.photo_url}
                                                            alt={getName(leader)}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                                            <HiUser className="h-20 w-20 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 transition-opacity group-hover/card:opacity-100" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-lg font-bold text-slate-900 group-hover/card:text-blue-600 transition-colors">
                                                        {getName(leader)}
                                                    </h4>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        {getTitle(leader)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Fade edges */}
                                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


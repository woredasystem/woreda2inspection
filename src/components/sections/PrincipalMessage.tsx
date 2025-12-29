"use client";

import Image from "next/image";
import { SupabaseImage } from "@/components/SupabaseImage";
import { motion } from "framer-motion";
import { LeaderRecord } from "@/types";
import { HiUser } from "react-icons/hi2";
import { useTranslations, useLocale } from 'next-intl';

interface PrincipalMessageProps {
    principal: LeaderRecord;
}

export function PrincipalMessage({ principal }: PrincipalMessageProps) {
    const t = useTranslations();
    const locale = useLocale();

    const getName = () => {
        if (locale === 'am') return principal.name_am || principal.name;
        if (locale === 'or') return principal.name_or || principal.name;
        return principal.name;
    };

    const getTitle = () => {
        if (locale === 'am') return principal.title_am || principal.title;
        if (locale === 'or') return principal.title_or || principal.title;
        return principal.title;
    };

    const getSpeech = () => {
        if (locale === 'am') return principal.speech_am || principal.speech;
        if (locale === 'or') return principal.speech_or || principal.speech;
        return principal.speech || t('leaders.principalSpeech');
    };

    return (
        <section id="message" className="relative py-12 md:py-24 scroll-mt-32 overflow-hidden">
            {/* Soft background reusing hero image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/herobg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white/90" />
            </div>
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid gap-12 lg:grid-cols-2 items-center"
                >
                    {/* Left: Large Photo */}
                    <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl">
                        {principal.photo_url ? (
                            <SupabaseImage
                                src={principal.photo_url}
                                alt={getName()}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-6 text-slate-400">
                                    <HiUser className="h-40 w-40" />
                                    <span className="text-lg font-medium">{t('leaders.administratorPhoto')}</span>
                                </div>
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />

                        {/* Name Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h2 className="text-3xl font-bold">{getName()}</h2>
                            <p className="text-lg font-medium opacity-90">{getTitle()}</p>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2 text-blue-600">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
                            </span>
                            <span className="text-sm font-bold uppercase tracking-wider">
                                {t('leaders.administratorMessage')}
                            </span>
                        </div>
                        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-slate-700 lg:text-3xl">
                            "{getSpeech()}"
                        </blockquote>
                        <div className="pt-4">
                            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto lg:mx-0" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}


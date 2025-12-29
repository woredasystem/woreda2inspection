"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderRecord } from "@/types";
import { HiUser, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useTranslations, useLocale } from 'next-intl';
import { useState } from "react";

interface LeaderMessagesCarouselProps {
    leaders: LeaderRecord[];
}

export function LeaderMessagesCarousel({ leaders }: LeaderMessagesCarouselProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const getSpeech = (leader: LeaderRecord) => {
        if (locale === 'am') return leader.speech_am || leader.speech;
        if (locale === 'or') return leader.speech_or || leader.speech;
        return leader.speech || '';
    };

    const nextLeader = () => {
        setCurrentIndex((prev) => (prev + 1) % leaders.length);
    };

    const prevLeader = () => {
        setCurrentIndex((prev) => (prev - 1 + leaders.length) % leaders.length);
    };

    const currentLeader = leaders[currentIndex];

    if (!currentLeader) return null;

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
                    key={currentLeader.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-12 lg:grid-cols-2 items-center"
                >
                    {/* Left: Large Photo */}
                    <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl">
                        {currentLeader.photo_url ? (
                            <Image
                                src={currentLeader.photo_url}
                                alt={getName(currentLeader)}
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
                            <h2 className="text-3xl font-bold">{getName(currentLeader)}</h2>
                            <p className="text-lg font-medium opacity-90">{getTitle(currentLeader)}</p>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="space-y-8 text-center lg:text-left relative">
                        {/* Navigation buttons - only show if multiple leaders */}
                        {leaders.length > 1 && (
                            <div className="absolute -top-4 right-0 flex items-center gap-2">
                                <button
                                    onClick={prevLeader}
                                    className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                                    aria-label="Previous leader"
                                >
                                    <HiChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-xs font-medium text-slate-500 px-2">
                                    {currentIndex + 1} / {leaders.length}
                                </span>
                                <button
                                    onClick={nextLeader}
                                    className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                                    aria-label="Next leader"
                                >
                                    <HiChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2 text-blue-600">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
                            </span>
                            <span className="text-sm font-bold uppercase tracking-wider">
                                {currentLeader.category === 'principal' 
                                    ? t('leaders.administratorMessage')
                                    : t('hero.leadersMessage')}
                            </span>
                        </div>
                        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-slate-700 lg:text-3xl">
                            "{getSpeech(currentLeader)}"
                        </blockquote>
                        <div className="pt-4">
                            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto lg:mx-0" />
                        </div>

                        {/* Dots indicator for multiple leaders */}
                        {leaders.length > 1 && (
                            <div className="flex justify-center lg:justify-start gap-2 pt-4">
                                {leaders.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentIndex
                                                ? 'w-8 bg-blue-600'
                                                : 'w-2 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                        aria-label={`Go to leader ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}


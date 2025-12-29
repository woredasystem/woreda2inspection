"use client";

import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import { HiArrowRight, HiArrowDown } from "react-icons/hi2";
import { motion } from "framer-motion";

export function HeroSection() {
    const t = useTranslations();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-24 md:pt-20">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/herobg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-70"
                    priority
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/50 to-white/70 z-0" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-10"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-6 py-2 shadow-md border border-blue-100"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{t('hero.badgeText')}</span>
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                        <span className="block bg-gradient-to-r from-[#4169E1] via-blue-700 to-[#4169E1] bg-clip-text text-transparent">
                            {t('hero.mainTitle')}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl leading-relaxed text-slate-700 font-semibold"
                    >
                        {t('hero.subtitleText')}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="flex flex-wrap justify-center gap-4 pt-6"
                    >
                        <button
                            onClick={() => scrollToSection('members')}
                            // Assuming 'members' ID is targeted. I need to make sure the LeadersSection wrapper has this ID.
                            className="group inline-flex items-center gap-2 rounded-full bg-[#4169E1] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-[#3557c7] hover:scale-105 hover:shadow-2xl"
                        >
                            {t('hero.viewMembers')}
                            <HiArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                        </button>

                        <Link
                            href="/appointments"
                            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl"
                        >
                            {t('hero.appointment')}
                            <HiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Enhanced Background decorative elements */}
            <div className="absolute top-1/4 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200 blur-3xl opacity-40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-200 blur-3xl opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-indigo-200 blur-3xl opacity-30 pointer-events-none" />
        </section>
    );
}

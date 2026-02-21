"use client";

import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import { HiLockClosed } from "react-icons/hi2";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { publicEnv } from "@/lib/env";

export function Navbar() {
    const t = useTranslations();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-2 md:py-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image
                            src="/logo.jpg"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-900">
                            {t('navbar.title')}
                        </span>
                        {/* Motto - Mobile */}
                        <span className="md:hidden block text-xs font-semibold bg-gradient-to-r from-[#4169E1] to-purple-600 bg-clip-text text-transparent mt-0.5">
                            {t('navbar.motto')}
                        </span>
                    </div>
                </div>

                {/* Motto - Desktop Centered */}
                <div className="hidden md:flex items-center">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50">
                        <p className="text-sm font-bold bg-gradient-to-r from-[#4169E1] to-purple-600 bg-clip-text text-transparent">
                            {t('navbar.motto')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#4169E1] px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#3557c7] hover:shadow-lg"
                    >
                        <HiLockClosed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{t('common.adminLogin')}</span>
                        <span className="sm:hidden">Admin</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

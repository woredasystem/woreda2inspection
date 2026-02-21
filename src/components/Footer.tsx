"use client";

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-900">
            {t('footerTitle')}
          </p>
        </div>

        <div className="text-xs text-slate-400">
          © 2018 {t('allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}

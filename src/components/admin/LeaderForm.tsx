"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiPhoto, HiPencilSquare, HiCloudArrowUp, HiSparkles } from "react-icons/hi2";
import { createLeader, updateLeader, uploadLeaderImage } from "@/lib/leader-actions";
import type { LeaderRecord } from "@/types";
import Image from "next/image";
import { SupabaseImage } from "@/components/SupabaseImage";
import { useTranslations } from "next-intl";

interface LeaderFormProps {
    initialData?: LeaderRecord;
    onSuccess?: () => void;
}

type Language = 'en' | 'am' | 'or';

export function LeaderForm({ initialData, onSuccess }: LeaderFormProps) {
    const t = useTranslations('admin');
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.photo_url || null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<Language>('en');
    const [category, setCategory] = useState<string>(initialData?.category || 'commission-committee');

    const languages = [
        { id: 'en', label: t('english'), flag: '🇬🇧' },
        { id: 'am', label: t('amharic'), flag: '🇪🇹' },
        { id: 'or', label: t('oromifa'), flag: '🌳' },
    ] as const;

    const categories = [
        { id: 'principal', label: t('catPrincipal') },
        { id: 'commission-committee', label: t('catCommission') },
        { id: 'management', label: t('catManagement') },
        { id: 'work-leadership', label: t('catWorkList') },
        { id: 'monitoring-committees', label: t('catMonitoring') },
    ];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);

        // English
        const name = formData.get("name") as string;
        const title = formData.get("title") as string;
        const speech = formData.get("speech") as string;

        // Amharic
        const name_am = formData.get("name_am") as string;
        const title_am = formData.get("title_am") as string;
        const speech_am = formData.get("speech_am") as string;

        // Oromifa
        const name_or = formData.get("name_or") as string;
        const title_or = formData.get("title_or") as string;
        const speech_or = formData.get("speech_or") as string;

        const sort_order = parseInt(formData.get("sort_order") as string) || 0;
        const selectedCategory = formData.get("category") as LeaderRecord['category'];

        const imageFile = formData.get("image") as File;

        try {
            let photoUrl = initialData?.photo_url;

            if (imageFile && imageFile.size > 0) {
                photoUrl = await uploadLeaderImage(imageFile);
            }

            const leaderData = {
                name,
                title,
                speech: speech || undefined,
                name_am: name_am || undefined,
                title_am: title_am || undefined,
                speech_am: speech_am || undefined,
                name_or: name_or || undefined,
                title_or: title_or || undefined,
                speech_or: speech_or || undefined,
                category: selectedCategory,
                sort_order,
                photo_url: photoUrl,
            };

            if (initialData) {
                await updateLeader(initialData.id, leaderData);
                setStatus({ type: "success", message: t('leaderUpdated') });
            } else {
                await createLeader(leaderData);
                setStatus({ type: "success", message: t('leaderCreated') });
                if (!initialData) {
                    formRef.current?.reset();
                    setPreviewImage(null);
                    setCategory('commission-committee');
                }
            }

            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : t('failedToSaveLeader')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewImage(url);

            // Manually update the file input
            const input = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
            }
        }
    };

    return (
        <motion.form
            ref={formRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-2xl relative overflow-hidden group"
        >
            {/* Decorative Background Blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -z-10 group-hover:bg-blue-200/40 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl -z-10 group-hover:bg-purple-200/40 transition-colors duration-700" />

            {/* Language Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                {languages.map((lang) => (
                    <button
                        key={lang.id}
                        type="button"
                        onClick={() => setActiveTab(lang.id as Language)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === lang.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        {lang.label}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {/* Category & Sort Order */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">
                            {t('leaderCategory')} <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">
                            {t('sortOrder')}
                        </label>
                        <input
                            type="number"
                            name="sort_order"
                            defaultValue={initialData?.sort_order || 0}
                            className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Name Input - All Langs */}
                <div className={`space-y-2 ${activeTab === 'en' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderName')} <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={initialData?.name}
                        required
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'am' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderNameAm')}
                    </label>
                    <input
                        type="text"
                        name="name_am"
                        defaultValue={initialData?.name_am}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'or' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderNameOr')}
                    </label>
                    <input
                        type="text"
                        name="name_or"
                        defaultValue={initialData?.name_or}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>

                {/* Title Input - All Langs */}
                <div className={`space-y-2 ${activeTab === 'en' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderTitle')} <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={initialData?.title}
                        required
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'am' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderTitleAm')}
                    </label>
                    <input
                        type="text"
                        name="title_am"
                        defaultValue={initialData?.title_am}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'or' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderTitleOr')}
                    </label>
                    <input
                        type="text"
                        name="title_or"
                        defaultValue={initialData?.title_or}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                    />
                </div>

                {/* Speech/Message Input - Available for all leaders, displayed on homepage for principal */}
                <div className={`space-y-2 ${activeTab === 'en' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderSpeech')} {category === 'principal' && <span className="text-red-400">*</span>}
                        {category !== 'principal' && <span className="text-xs font-normal text-slate-500">(Only displayed for principal on homepage)</span>}
                    </label>
                    <textarea
                        name="speech"
                        defaultValue={initialData?.speech}
                        required={category === 'principal'}
                        rows={6}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg leading-relaxed"
                        placeholder={category === 'principal' ? "Enter the principal's message..." : "Optional message (only shown for principal)"}
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'am' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderSpeechAm')}
                    </label>
                    <textarea
                        name="speech_am"
                        defaultValue={initialData?.speech_am}
                        rows={6}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg leading-relaxed"
                        placeholder="መልዕክት (አማርኛ)"
                    />
                </div>
                <div className={`space-y-2 ${activeTab === 'or' ? 'block' : 'hidden'}`}>
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('leaderSpeechOr')}
                    </label>
                    <textarea
                        name="speech_or"
                        defaultValue={initialData?.speech_or}
                        rows={6}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg leading-relaxed"
                        placeholder="Ergaa (Oromiffa)"
                    />
                </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                    {t('leaderCategory') === 'principal' ? t('coverImage') : t('photo')}
                    <HiSparkles className="w-4 h-4 text-yellow-500" />
                </label>

                <div
                    className={`relative group rounded-3xl border-3 border-dashed transition-all duration-300 overflow-hidden min-h-[240px] flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-slate-200 hover:border-indigo-300'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload')?.click()}
                >
                    <input
                        id="image-upload"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    {previewImage ? (
                        <>
                            <SupabaseImage
                                src={previewImage}
                                alt="Preview"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                <span className="px-6 py-3 bg-white/20 border border-white/40 rounded-full text-white font-bold backdrop-blur-md shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    {t('changeImage')}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-center p-8 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                                <HiPhoto className="w-10 h-10 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{t('clickOrDragMap')}</h3>
                                <p className="text-slate-500 mt-1 font-medium">{t('aspectRatioMap')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-lg font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    {isSubmitting ? (
                        <>
                            <HiCloudArrowUp className="w-6 h-6 animate-bounce" />
                            <span>{t('processing')}</span>
                        </>
                    ) : (
                        <>
                            <HiPencilSquare className="w-6 h-6" />
                            <span>{initialData ? t('updateArticle') : t('leaderCreated')}</span>
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 border ${status.type === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                            }`}
                    >
                        {status.type === "success" ? (
                            <HiCheckCircle className="w-6 h-6 flex-shrink-0" />
                        ) : (
                            <HiXCircle className="w-6 h-6 flex-shrink-0" />
                        )}
                        <span className="font-bold">{status.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
}

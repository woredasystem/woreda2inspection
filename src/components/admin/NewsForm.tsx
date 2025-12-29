"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiPhoto, HiPencilSquare, HiCloudArrowUp, HiSparkles } from "react-icons/hi2";
import { createNewsItem, updateNewsItem, uploadNewsImage, uploadNewsImages } from "@/lib/news-actions";
import type { NewsRecord } from "@/types";
import Image from "next/image";
import { SupabaseImage } from "@/components/SupabaseImage";
import { useTranslations } from "next-intl";

interface NewsFormProps {
    initialData?: NewsRecord;
    onSuccess?: () => void;
}

export function NewsForm({ initialData, onSuccess }: NewsFormProps) {
    const t = useTranslations('admin');
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.cover_image_url || null);
    const [previewImages, setPreviewImages] = useState<string[]>(initialData?.cover_image_url ? [initialData.cover_image_url] : []);
    const [isDragging, setIsDragging] = useState(false);
    // Default new articles to "published = true" so they appear on the homepage immediately
    const [published, setPublished] = useState(initialData?.published ?? true);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const summary = formData.get("summary") as string;
        const content = formData.get("content") as string;
        const youtubeUrl = formData.get("youtube_url") as string;
        const imageFiles = formData.getAll("image") as File[];

        try {
            let coverImageUrl = initialData?.cover_image_url;
            const validImageFiles = imageFiles.filter(file => file.size > 0);

            if (validImageFiles.length > 0) {
                if (validImageFiles.length === 1) {
                    coverImageUrl = await uploadNewsImage(validImageFiles[0]);
                } else {
                    // Upload multiple images, use first as cover
                    const uploadedUrls = await uploadNewsImages(validImageFiles);
                    coverImageUrl = uploadedUrls[0];
                }
            }

            if (initialData) {
                await updateNewsItem(initialData.id, {
                    title,
                    summary,
                    content,
                    published,
                    cover_image_url: coverImageUrl,
                    youtube_url: youtubeUrl || undefined,
                });
                setStatus({ type: "success", message: "News updated successfully!" });
            } else {
                await createNewsItem({
                    title,
                    summary,
                    content,
                    published,
                    cover_image_url: coverImageUrl,
                    youtube_url: youtubeUrl || undefined,
                });
                setStatus({ type: "success", message: "News created successfully!" });
                formRef.current?.reset();
                setPreviewImage(null);
                setPreviewImages([]);
                // Keep the default as published for subsequent creations
                setPublished(true);
            }

            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to save news."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewImages(urls);
            setPreviewImage(urls[0]); // Set first as preview
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
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewImages(urls);
            setPreviewImage(urls[0]); // Set first as preview

            // Manually update the file input
            const input = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
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


            <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        Post Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={initialData?.title}
                        required
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                        placeholder="Enter an engaging headline..."
                    />
                </div>

                {/* Summary Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">Summary</label>
                    <textarea
                        name="summary"
                        defaultValue={initialData?.summary}
                        rows={2}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg resize-none"
                        placeholder="A brief teaser for the news card..."
                    />
                </div>

                {/* Content Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        name="content"
                        defaultValue={initialData?.content}
                        required
                        rows={8}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg leading-relaxed"
                        placeholder="Write your article here..."
                    />
                </div>

                {/* YouTube URL Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                        {t('youtubeLink')}
                    </label>
                    <input
                        type="url"
                        name="youtube_url"
                        defaultValue={initialData?.youtube_url}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-slate-100 px-5 py-4 text-base font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm focus:shadow-lg"
                        placeholder={t('pasteYoutube')}
                    />
                </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                    {t('coverImage')}
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
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    {previewImages.length > 0 ? (
                        <>
                            <div className="relative w-full h-full">
                                <SupabaseImage
                                    src={previewImages[0]}
                                    alt="Preview"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {previewImages.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        +{previewImages.length - 1} more
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                <span className="px-6 py-3 bg-white/20 border border-white/40 rounded-full text-white font-bold backdrop-blur-md shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    {previewImages.length > 1 ? `Change Images (${previewImages.length})` : "Change Image"}
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
                                <p className="text-slate-500 mt-1 font-medium">{t('multipleFilesAllowed')} • {t('aspectRatioMap')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Publishing Toggle */}
            <div
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${published ? 'bg-green-50 border-green-200 shadow-inner' : 'bg-slate-50 border-slate-200'}`}
                onClick={() => setPublished(!published)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${published ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                        {published ? <HiCheckCircle className="w-7 h-7" /> : <HiXCircle className="w-7 h-7" />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg ${published ? 'text-green-800' : 'text-slate-700'}`}>
                            {published ? "Published & Live" : "Draft Mode"}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                            {published ? "Visible to everyone on the public site" : "Only visible to admins"}
                        </p>
                    </div>
                </div>
                <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${published ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${published ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                {/* Hidden input for form submission */}
                <input type="hidden" name="published" value={published ? "on" : "off"} />
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
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <HiPencilSquare className="w-6 h-6" />
                            <span>{initialData ? "Update Article" : "Publish Article"}</span>
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

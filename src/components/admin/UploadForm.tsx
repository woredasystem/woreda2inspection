"use client";

import { FormEvent, useState, useMemo, useRef } from "react";
import { HiDocumentArrowUp, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { documentCategories } from "@/data/categories";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";

export function UploadForm() {
  const t = useTranslations('admin');
  const tCategories = useTranslations('categories');
  const [status, setStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = documentCategories.find((cat) => cat.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      setStatus(t('selectAtLeastOneFile'));
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        // Handle 207 Multi-Status (partial success) specifically if needed, 
        // or just use the summary message if provided.
        // The backend returns results array which we can check.
        if (result.results) {
          const successCount = result.results.filter((r: any) => r.status === 'success').length;
          const failCount = result.results.filter((r: any) => r.status === 'error').length;

          if (failCount === 0) {
            setStatus(t('uploadSuccess', { count: successCount }));
            if (formRef.current) {
              formRef.current.reset();
            }
            setSelectedCategory("");
          } else {
            setStatus(t('uploadPartial', { success: successCount, failed: failCount }));
          }
        } else {
          setStatus(result.message || t('uploadSuccess', { count: files.length }));
          if (formRef.current) {
            formRef.current.reset();
          }
          setSelectedCategory("");
        }
      } else {
        setStatus(t('uploadFailed', { error: result.message || t('unknownError') }));
      }
    } catch (error) {
      setStatus(t('uploadError', { error: error instanceof Error ? error.message : t('unknownError') }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 sm:gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('mainCode')}
          </label>
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 hover:border-slate-300"
          >
            <option value="">{t('selectCategory')}</option>
            {documentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.id} - {tCategories(category.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Selection */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('subCode')}
          </label>
          <select
            name="subcategory"
            required
            disabled={!selectedCategory || availableSubcategories.length === 0}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 hover:border-slate-300 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{t('selectSubcategory')}</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.code} value={subcategory.code}>
                {subcategory.code} - {tCategories(subcategory.code)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Year Input */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
          {t('year')}
        </label>
        <input
          type="text"
          name="year"
          placeholder="2017"
          required
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 hover:border-slate-300"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
          {t('documents')}
        </label>
        <div className="relative">
          <input
            type="file"
            name="files"
            accept=".pdf,.doc,.docx,.xlsx,.xls,.odt"
            multiple
            required
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 hover:border-slate-300 cursor-pointer file:mr-3 sm:file:mr-4 file:py-2 sm:file:py-2.5 file:px-4 sm:file:px-6 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 file:text-white hover:file:from-indigo-700 hover:file:to-purple-700 file:transition-all file:flex-shrink-0"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isUploading}
        className="group relative overflow-hidden inline-flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <HiDocumentArrowUp className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
        <span className="relative z-10 text-sm sm:text-base">
          {isUploading ? t('uploading') : t('upload')}
        </span>
      </motion.button>

      {/* Status Message */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 sm:gap-3 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-semibold ${status.includes(t('successfully')) || status.includes("success")
              ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
              : "bg-red-50 text-red-700 border-2 border-red-200"
            }`}
        >
          {status.includes(t('successfully')) || status.includes("success") ? (
            <HiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          ) : (
            <HiXCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          )}
          {status}
        </motion.div>
      )}
    </motion.form>
  );
}

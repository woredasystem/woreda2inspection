"use client";

import { useState } from "react";
import Link from "next/link";
import {
    HiDocumentText,
    HiDocumentArrowDown,
    HiTrash,
    HiChevronDown,
    HiChevronRight,
    HiPlus,
    HiFolder
} from "react-icons/hi2";
import { documentCategories } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentUploadRecord } from "@/types";
import { useTranslations } from "next-intl";

interface AdminDocumentsClientProps {
    documents: DocumentUploadRecord[];
}

export function AdminDocumentsClient({ documents }: AdminDocumentsClientProps) {
    const t = useTranslations('admin');
    const tCategories = useTranslations('categories');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    // Group documents by category and subcategory
    const groupedByCategory = documents.reduce<Record<string, Record<string, DocumentUploadRecord[]>>>((acc, doc) => {
        const categoryId = doc.category_id || "unknown";
        const subcategoryCode = doc.subcategory_code || "unknown";

        if (!acc[categoryId]) {
            acc[categoryId] = {};
        }
        if (!acc[categoryId][subcategoryCode]) {
            acc[categoryId][subcategoryCode] = [];
        }
        acc[categoryId][subcategoryCode].push(doc);
        return acc;
    }, {});

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleSubcategory = (key: string) => {
        const newExpanded = new Set(expandedSubcategories);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedSubcategories(newExpanded);
    };

    const handleDelete = async (documentId: string, fileName: string) => {
        if (!confirm(`${t('confirmDeleteDocument') || 'Delete'} "${fileName}"?`)) {
            return;
        }

        setDeletingId(documentId);
        try {
            const response = await fetch(`/api/admin/delete-document?id=${documentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(t('failedToDeleteDocument') || 'Failed to delete document');
            }

            // Refresh the page to show updated list
            window.location.reload();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert(t('failedToDeleteDocument') || 'Failed to delete document');
            setDeletingId(null);
        }
    };

    const toggleDocumentSelection = (documentId: string) => {
        const newSelected = new Set(selectedDocuments);
        if (newSelected.has(documentId)) {
            newSelected.delete(documentId);
        } else {
            newSelected.add(documentId);
        }
        setSelectedDocuments(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedDocuments.size === documents.length) {
            setSelectedDocuments(new Set());
        } else {
            setSelectedDocuments(new Set(documents.map(doc => doc.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDocuments.size === 0) {
            alert(t('selectAtLeastOneFile'));
            return;
        }

        if (!confirm(`${t('deleteSelected', { count: selectedDocuments.size })}?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedDocuments).map(docId =>
                fetch(`/api/admin/delete-document?id=${docId}`, {
                    method: "DELETE",
                })
            );

            await Promise.all(deletePromises);
            window.location.reload();
        } catch (error) {
            console.error("Error deleting documents:", error);
            alert(t('failedToDeleteDocument') || 'Failed to delete some documents');
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Bulk Actions Bar */}
            {documents.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <input
                                type="checkbox"
                                checked={selectedDocuments.size === documents.length && documents.length > 0}
                                onChange={() => { }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            {selectedDocuments.size === documents.length ? t('deselectAll') : t('selectAll')}
                        </button>

                        {selectedDocuments.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-50 border-2 border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-50"
                            >
                                <HiTrash className="h-4 w-4" />
                                {t('deleteSelected', { count: selectedDocuments.size })}
                            </button>
                        )}

                        <span className="text-sm font-medium text-slate-500 ml-auto">
                            {documents.length} {t('documents')}
                        </span>
                    </div>
                </section>
            )}

            {/* Categories */}
            <div className="space-y-6">
                {documentCategories.map((category) => {
                    const categoryDocs = groupedByCategory[category.id] || {};
                    const isCategoryExpanded = expandedCategories.has(category.id);
                    const totalDocsInCategory = Object.values(categoryDocs).reduce(
                        (sum, docs) => sum + docs.length,
                        0
                    );

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={category.id}
                            className="overflow-hidden rounded-3xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                        >
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="flex w-full items-center justify-between p-6 text-left transition hover:bg-slate-50/50 md:p-8"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${isCategoryExpanded ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {isCategoryExpanded ? (
                                            <HiChevronDown className="h-6 w-6" />
                                        ) : (
                                            <HiChevronRight className="h-6 w-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                                            {category.id} - {tCategories(category.id)}
                                        </h2>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            {totalDocsInCategory} {t('documents')}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isCategoryExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-2 md:p-4">
                                            {category.subcategories.map((subcategory) => {
                                                const subcategoryDocs = categoryDocs[subcategory.code] || [];
                                                const subcategoryKey = `${category.id}-${subcategory.code}`;
                                                const isSubcategoryExpanded = expandedSubcategories.has(subcategoryKey);

                                                return (
                                                    <div
                                                        key={subcategory.code}
                                                        className="mb-2 overflow-hidden rounded-3xl bg-white border border-slate-100 last:mb-0"
                                                    >
                                                        <button
                                                            onClick={() => toggleSubcategory(subcategoryKey)}
                                                            className="flex w-full items-center justify-between p-4 pl-6 text-left transition hover:bg-slate-50"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {isSubcategoryExpanded ? (
                                                                    <HiChevronDown className="h-4 w-4 text-slate-400" />
                                                                ) : (
                                                                    <HiChevronRight className="h-4 w-4 text-slate-400" />
                                                                )}
                                                                <div>
                                                                    <h3 className="text-base font-bold text-slate-800">
                                                                        {subcategory.code} – {tCategories(subcategory.code)}
                                                                    </h3>
                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        {subcategoryDocs.length} {t('documents')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>

                                                        <AnimatePresence>
                                                            {isSubcategoryExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: "auto" }}
                                                                    exit={{ height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    {subcategoryDocs.length === 0 ? (
                                                                        <div className="p-6 text-center">
                                                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                                                <HiFolder className="h-6 w-6 text-slate-400" />
                                                                            </div>
                                                                            <p className="text-sm text-slate-500">{t('noDocumentsCategory') || 'No documents in this category yet'}</p>
                                                                            <Link
                                                                                href="/admin/upload"
                                                                                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                                                            >
                                                                                <HiPlus className="h-4 w-4" />
                                                                                {t('uploadDocument')}
                                                                            </Link>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-3 p-6 pt-2">
                                                                            {subcategoryDocs.map((document) => (
                                                                                <motion.article
                                                                                    whileHover={{ y: -2, scale: 1.01 }}
                                                                                    key={document.id}
                                                                                    className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                                                                >
                                                                                    <div className="flex items-start gap-3 min-w-0 w-full">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedDocuments.has(document.id)}
                                                                                            onChange={() => toggleDocumentSelection(document.id)}
                                                                                            className="mt-2 h-5 w-5 flex-shrink-0 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                                        />
                                                                                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                                            <HiDocumentText className="h-5 w-5" />
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p className="text-sm font-bold text-slate-900 break-words leading-tight" title={document.file_name}>
                                                                                                {document.file_name}
                                                                                            </p>
                                                                                            <p className="text-xs text-slate-500 mt-1 uppercase font-medium">
                                                                                                {document.year} • {document.file_name.split('.').pop() || 'FILE'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
                                                                                        <Link
                                                                                            href={document.storage_url}
                                                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-600"
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                            title={t('downloadFile') || 'Download'}
                                                                        >
                                                                            <HiDocumentArrowDown className="h-4 w-4" />
                                                                            <span className="sm:hidden">{t('downloadFile') || 'Download'}</span>
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleDelete(document.id, document.file_name)}
                                                                            disabled={deletingId === document.id}
                                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                                                            title={t('delete') || 'Delete'}
                                                                        >
                                                                            <HiTrash className="h-4 w-4" />
                                                                            <span className="sm:hidden">{deletingId === document.id ? (t('uploading') || 'Deleting...') : (t('delete') || 'Delete')}</span>
                                                                        </button>
                                                                                    </div>
                                                                                </motion.article>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { HiDocumentArrowDown, HiEye, HiChevronDown, HiChevronRight, HiFolder, HiDocumentText } from "react-icons/hi2";
import type { DocumentUploadRecord } from "@/types";
import { documentCategories } from "@/data/categories";
import { FileViewer } from "./FileViewer";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';

interface DocumentsByCategoryProps {
  documents: DocumentUploadRecord[];
  accessToken?: string;
}

export function DocumentsByCategory({ documents, accessToken }: DocumentsByCategoryProps) {
  const t = useTranslations();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(
    new Set()
  );
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Group documents by category and subcategory
  const groupedByCategory = documents.reduce<
    Record<
      string,
      Record<string, DocumentUploadRecord[]>
    >
  >((acc, doc) => {
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

  // Sort categories by their ID (numeric order)
  const sortedCategories = documentCategories
    .filter((cat) => groupedByCategory[cat.id])
    .sort((a, b) => {
      const numA = parseInt(a.id) || 0;
      const numB = parseInt(b.id) || 0;
      return numA - numB;
    });

  if (sortedCategories.length === 0) {
    return (
      <div className="rounded-[32px] bg-white p-12 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <HiFolder className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{t('documents.noDocuments')}</h3>
        <p className="mt-2 text-slate-500">
          {t('documents.noDocumentsMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const categoryDocs = groupedByCategory[category.id];
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
            className="overflow-hidden rounded-[32px] bg-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex w-full items-center justify-between p-6 text-left transition hover:bg-slate-50/50 md:p-8"
            >
              <div className="flex items-center gap-6">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${isCategoryExpanded ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  {isCategoryExpanded ? (
                    <HiChevronDown className="h-6 w-6" />
                  ) : (
                    <HiChevronRight className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                    {category.id} - {category.label}
                  </h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {totalDocsInCategory} document{totalDocsInCategory !== 1 ? "s" : ""}
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
                    {category.subcategories
                      .filter((subcat) => categoryDocs[subcat.code])
                      .map((subcategory) => {
                        const subcategoryDocs = categoryDocs[subcategory.code];
                        const subcategoryKey = `${category.id}-${subcategory.code}`;
                        const isSubcategoryExpanded = expandedSubcategories.has(
                          subcategoryKey
                        );

                        // Group documents by year within subcategory
                        const docsByYear = subcategoryDocs.reduce<
                          Record<string, DocumentUploadRecord[]>
                        >((acc, doc) => {
                          if (!acc[doc.year]) {
                            acc[doc.year] = [];
                          }
                          acc[doc.year].push(doc);
                          return acc;
                        }, {});

                        const sortedYears = Object.keys(docsByYear).sort(
                          (a, b) => parseInt(b) - parseInt(a)
                        );

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
                                    {subcategory.code} – {subcategory.label}
                                  </h3>
                                  <p className="text-xs font-medium text-slate-500">
                                    {subcategoryDocs.length} file
                                    {subcategoryDocs.length !== 1 ? "s" : ""}
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
                                  <div className="space-y-6 p-6 pt-2">
                                    {sortedYears.map((year) => (
                                      <div key={year} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <div className="h-px flex-1 bg-slate-100"></div>
                                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Year {year}
                                          </p>
                                          <div className="h-px flex-1 bg-slate-100"></div>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2">
                                          {docsByYear[year].map((document) => (
                                            <motion.article
                                              whileHover={{ y: -2, scale: 1.01 }}
                                              key={document.id}
                                              className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                            >
                                              <div className="flex items-start gap-3 min-w-0 w-full">
                                                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                  <HiDocumentText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="text-sm font-bold text-slate-900 break-words leading-tight" title={document.file_name}>
                                                    {document.file_name}
                                                  </p>
                                                  <p className="text-xs text-slate-500 mt-1 uppercase font-medium">
                                                    {year} • {document.file_name.split('.').pop() || 'FILE'}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
                                                <button
                                                  onClick={() =>
                                                    setViewingFile({
                                                      url: document.storage_url,
                                                      name: document.file_name,
                                                    })
                                                  }
                                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                                  title="View"
                                                >
                                                  <HiEye className="h-4 w-4" />
                                                  <span className="sm:hidden">View</span>
                                                </button>
                                                <Link
                                                  href={document.storage_url}
                                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  title="Download"
                                                >
                                                  <HiDocumentArrowDown className="h-4 w-4" />
                                                  <span className="sm:hidden">Download</span>
                                                </Link>
                                              </div>
                                            </motion.article>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.url}
          fileName={viewingFile.name}
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}


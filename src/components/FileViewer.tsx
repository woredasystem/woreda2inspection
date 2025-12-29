"use client";

import { useEffect, useState } from "react";
import { HiXMark, HiArrowDownTray, HiDocumentText } from "react-icons/hi2";

interface FileViewerProps {
  fileUrl: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  accessToken?: string;
}

export function FileViewer({ fileUrl, fileName, isOpen, onClose, accessToken }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string>("");

  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(fileExtension);
  const isPdf = fileExtension === "pdf";
  const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension);
  const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(fileExtension);
  const isText = ["txt", "md", "csv", "json", "xml", "html", "css", "js"].includes(fileExtension);
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      // For Office documents, we need to get the direct public Supabase Storage URL
      // because Microsoft Office Online Viewer can't access our authenticated proxy
      if (isOffice && accessToken) {
        // Fetch the public URL from our API
        fetch(`/api/get-public-file-url?url=${encodeURIComponent(fileUrl)}&token=${encodeURIComponent(accessToken)}`)
          .then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              const errorMsg = errorData.error || `Failed to get public file URL (${res.status})`;
              console.error("❌ API error:", errorMsg, errorData);
              throw new Error(errorMsg);
            }
            const data = await res.json();
            const publicUrl = data.publicUrl;
            const isAccessible = data.isAccessible;
            const accessibilityError = data.error;
            const message = data.message;


            if (!isAccessible) {
              console.error("❌ File is not publicly accessible. Office viewer will fail.");
              console.error("💡 Solution: Ensure Supabase Storage bucket 'documents' is set to public");

              // For Office documents, we can't use our proxy because Microsoft's servers need direct access
              // So we'll show a helpful error with download option
              setError(
                message ||
                `Office documents require public file access. ` +
                `The file is not publicly accessible (${accessibilityError}). ` +
                `\n\nPlease ensure your Supabase Storage bucket 'documents' is set to public.` +
                `\n\nAlternatively, download the file to view it.`
              );
              setLoading(false);
              return;
            }


            // Use Microsoft Office Online Viewer with the public Supabase Storage URL
            // Note: publicUrl already has properly encoded path components, so we encode the entire URL
            // for use as a query parameter (this is correct - we're encoding the URL as a whole)
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;

            setViewUrl(officeViewerUrl);
            // Don't set loading to false yet - let the iframe handle it
          })
          .catch((err) => {
            console.error("❌ Error fetching public URL:", err);
            setError(err.message || "Failed to load document. The file may not be publicly accessible. Please try downloading instead.");
            setLoading(false);
          });
      } else {
        // For non-Office files, use our proxy
        const getProxiedUrl = () => {
          if (accessToken) {
            return `/api/view-file?url=${encodeURIComponent(fileUrl)}&token=${encodeURIComponent(accessToken)}`;
          }
          return fileUrl;
        };

        const proxyUrl = getProxiedUrl();
        setViewUrl(proxyUrl);
        // Loading will be handled by onLoad/onError handlers
      }
    } else {
      // Reset when closed
      setViewUrl("");
      setLoading(false);
      setError(null);
    }
  }, [isOpen, fileUrl, accessToken, isOffice]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-8">
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {fileName}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              {fileExtension.toUpperCase()} file
            </p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 transition hover:bg-slate-200"
            >
              <HiArrowDownTray className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-red-50 hover:text-red-600"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
          {loading && !error && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
                <p className="text-sm font-medium text-slate-600">Loading file...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center max-w-2xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <HiXMark className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-xl font-bold text-slate-900 mb-3">
                  Unable to View File
                </p>
                <div className="text-sm text-slate-600 mb-8 text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm whitespace-pre-line">
                  {error}
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
                  >
                    <HiArrowDownTray className="h-4 w-4" />
                    Download File
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {!error && viewUrl && (
            <div className="h-full w-full rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
              {isImage && (
                <div className="flex h-full items-center justify-center p-4">
                  <img
                    src={viewUrl}
                    alt={fileName}
                    className="max-h-full max-w-full object-contain"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError("Failed to load image. The file may be corrupted or inaccessible.");
                    }}
                  />
                </div>
              )}

              {isPdf && (
                <iframe
                  src={viewUrl}
                  className="h-full w-full border-0 bg-white"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError("Failed to load PDF. Please try downloading the file.");
                  }}
                  title={`Viewing ${fileName}`}
                />
              )}

              {isVideo && (
                <div className="flex h-full items-center justify-center p-4 bg-black">
                  <video
                    src={viewUrl}
                    controls
                    className="max-h-full max-w-full"
                    onLoadedData={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError("Failed to load video. The file may be corrupted or in an unsupported format.");
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {isAudio && (
                <div className="flex h-full items-center justify-center p-4">
                  <div className="w-full max-w-2xl rounded-2xl bg-slate-50 p-8">
                    <div className="mb-6 flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <HiDocumentText className="h-10 w-10" />
                      </div>
                    </div>
                    <audio
                      src={viewUrl}
                      controls
                      className="w-full"
                      onLoadedData={() => setLoading(false)}
                      onError={() => {
                        setLoading(false);
                        setError("Failed to load audio. The file may be corrupted or in an unsupported format.");
                      }}
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                </div>
              )}

              {isText && (
                <iframe
                  src={viewUrl}
                  className="h-full w-full border-0 bg-white p-4"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError("Failed to load text file.");
                  }}
                  title={`Viewing ${fileName}`}
                />
              )}

              {isOffice && (
                <div className="relative h-full w-full">
                  {viewUrl ? (
                    <>
                      <iframe
                        key={`office-${fileUrl}`}
                        src={viewUrl}
                        className="h-full w-full border-0 bg-white"
                        onLoad={() => {
                          // Office viewer loads asynchronously, wait a bit before hiding loader
                          setTimeout(() => {
                            setLoading(false);
                          }, 2000);
                        }}
                        onError={(e) => {
                          console.error("❌ Office viewer iframe error:", e);
                          setLoading(false);
                          setError("Failed to load document in Office viewer. The file may not be publicly accessible. Please try downloading instead.");
                        }}
                        title={`Viewing ${fileName}`}
                        allow="fullscreen"
                        style={{ minHeight: "600px" }}
                      />
                      {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
                          <div className="text-center">
                            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
                            <p className="text-sm text-slate-600">Loading document viewer...</p>
                            <p className="text-xs text-slate-500 mt-2">This may take a few moments</p>
                            <p className="text-xs text-slate-400 mt-1">If this takes too long, the file may not be publicly accessible</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
                        <p className="text-sm text-slate-600">Preparing document viewer...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isImage && !isPdf && !isVideo && !isAudio && !isText && !isOffice && (
                <div className="flex h-full items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-8">
                      <p className="text-lg font-semibold text-slate-900 mb-2">
                        Preview not available
                      </p>
                      <p className="text-sm text-slate-600 mb-4">
                        This file type ({fileExtension.toUpperCase()}) cannot be previewed in the browser.
                        Please download the file to view it.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
                      >
                        <HiArrowDownTray className="h-4 w-4" />
                        Download File
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

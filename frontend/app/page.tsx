 "use client";

import React, { useState, useEffect, useRef } from "react";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Save from "lucide-react/dist/esm/icons/save";
import RefreshCcw from "lucide-react/dist/esm/icons/refresh-ccw";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardContent } from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import dynamic from "next/dynamic";
import { Toast } from "./components/ui/Toast";
import Link from "next/link";
import { useTheme } from "./context/ThemeContext";
import Moon from "lucide-react/dist/esm/icons/moon";
import Sun from "lucide-react/dist/esm/icons/sun";


const UploadZone = dynamic(() => import("./components/features/UploadZone").then(mod => mod.UploadZone), {
  loading: () => <div className="p-12 text-center text-slate-500">Loading Upload Zone...</div>,
  ssr: false
});
const ReviewTable = dynamic(() => import("./components/features/ReviewTable").then(mod => mod.ReviewTable), {
  loading: () => <div className="p-8 text-center text-slate-500">Loading Review Table...</div>,
  ssr: false
});
const DocumentPreview = dynamic(() => import("./components/features/DocumentPreview").then(mod => mod.DocumentPreview), {
  loading: () => <div className="p-8 text-center text-slate-500">Loading Preview...</div>,
  ssr: false
});
const InsightsDashboard = dynamic(() => import("./components/features/InsightsDashboard").then(mod => mod.InsightsDashboard), {
  loading: () => <div className="p-12 text-center text-slate-500">Aggregating Fiscal Data...</div>,
  ssr: false
});
import { ReviewService, type ReviewInvoiceData, type ProcessingStatus } from "./services";
import { cn } from "./utils";

export default function InvoiceReviewApp() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<"review" | "dashboard">("review");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [loadingMessage, setLoadingMessage] = useState<string>("Processing...");
  const [data, setData] = useState<ReviewInvoiceData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [verifiedFields, setVerifiedFields] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const mapBackendDataToFrontend = (backendData: any): ReviewInvoiceData => {
    return {
      document_id: backendData.document_id,
      invoice_id: backendData.invoice_id,
      vendor_name: { value: backendData.vendor || "Unknown Vendor", confidence: 0.85, source: "ai" },
      invoice_number: { value: backendData.invoice_number || "", confidence: 0.85, source: "ai" },
      date: { value: backendData.date || "", confidence: 0.9, source: "ai" },
      total_amount: { value: backendData.total || 0, confidence: 0.9, source: "ai" },
      tax_amount: { value: backendData.tax || 0, confidence: 0.6, source: "ai" },
      currency: backendData.currency || "$",
      line_items: backendData.line_items?.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        description: { value: item.description || "", confidence: 0.8, source: "ai" },
        quantity: { value: item.quantity || 1, confidence: 0.8, source: "ai" },
        unit_price: { value: item.unit_price || 0, confidence: 0.8, source: "ai" },
        amount: { value: item.amount || 0, confidence: 0.8, source: "ai" }
      })) || []
    };
  };

  const handleFileSelect = async (file: File) => {
    setStatus("uploading");
    setLoadingMessage("Uploading to secure vault...");
    setErrorMessage(null);
    setFileName(file.name);
    setLastFile(file);
    setVerifiedFields(new Set());

    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);

    try {
      const taskId = await ReviewService.upload(file);
      setStatus("processing");
      setLoadingMessage("Analyzing document structure...");

      let step = 0;
      const interval = setInterval(async () => {
        try {
          step++;
          if (step === 3) setLoadingMessage("Extracting financial data...");
          if (step === 6) setLoadingMessage("Running auditor validation...");
          if (step === 9) setLoadingMessage("Finalizing results...");

          const res = await ReviewService.getTaskStatus(taskId);
          if (res.status === "completed") {
            if (timerRef.current) clearInterval(timerRef.current);
            setData(mapBackendDataToFrontend(res.data));
            setStatus("completed");
          } else if (res.status === "failed") {
            if (timerRef.current) clearInterval(timerRef.current);
            setStatus("error");
            setErrorMessage(res.error || "No invoice data found");
          }
        } catch (err) {
          console.error(err);
        }
      }, 1000);

      timerRef.current = interval;

    } catch (err) {
      setStatus("error");
      setErrorMessage("Failed to upload file");
    }
  };

  const handleApprove = async () => {
    if (!data) return;
    setStatus("processing");
    await ReviewService.submitReview(data);
    setStatus("idle");
    setData(null);
  };

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-500",
        theme === "night" ? "bg-white text-black" : "bg-slate-950 text-black",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="bg-sky-500 p-2 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight border-b-2 border-sky-500/20 pb-1">
                  FIN-CORE
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Enterprise Intelligence
                </p>
              </div>
            </div>

            <nav className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
              <button
                onClick={() => setView("review")}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  view === "review"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Review Flow
              </button>
              <Link
                href="/dashboard"
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-300",
                )}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900/50 border border-http://localhost:3000-800 text-slate-400 hover:text-sky-500 hover:border-sky-500/50 transition-all flex items-center gap-3 shadow-lg"
            >
              {theme === "night" ? (
                <>
                  <Moon className="w-4 h-4 text-sky-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Night
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    white
                  </span>
                </>
              )}
            </button>
            {data && view === "review" && (
              <Badge variant="warning">Manual Review Required</Badge>
            )}
          </div>
        </header>

        {view === "dashboard" ? (
          <InsightsDashboard />
        ) : (
          <>
            {status === "idle" ||
            status === "uploading" ||
            status === "processing" ||
            status === "error" ? (
              <div className="flex flex-col items-center">
                {status !== "error" && (
                  <div className="w-full">
                    <UploadZone
                      onFileSelect={handleFileSelect}
                      status={status}
                    />
                    {(status === "uploading" || status === "processing") && (
                      <div className="mt-8 text-center animate-pulse">
                        <p className="text-sky-500 font-bold tracking-widest text-xs uppercase">
                          {loadingMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {status === "error" && !errorMessage && (
                  <div className="w-full mt-12 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <p>An error occurred during processing</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatus("idle");
                        setErrorMessage(null);
                      }}
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <DocumentPreview
                    fileUrl={filePreviewUrl}
                    fileName={fileName}
                    activeHighlight={activeHighlight}
                  />

                  <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <CardHeader className="flex items-center justify-between py-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-sky-500" />
                        <h2 className="font-bold text-slate-100 uppercase tracking-widest text-sm">
                          Review & Verify
                        </h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setData(null);
                          setStatus("idle");
                          setFilePreviewUrl(null);
                        }}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" /> Restart
                      </Button>
                    </CardHeader>
                    <CardContent className="bg-slate-900/20 p-6">
                      <ReviewTable
                        data={data}
                        onUpdate={setData}
                        onFieldFocus={(field: string) => {
                          if (["total_amount", "date"].includes(field)) {
                            setVerifiedFields((prev) =>
                              new Set(prev).add(field),
                            );
                          }

                          const mockCoords: any = {
                            vendor_name: {
                              top: 10,
                              left: 10,
                              width: 30,
                              height: 5,
                            },
                            invoice_number: {
                              top: 10,
                              left: 70,
                              width: 20,
                              height: 4,
                            },
                            date: { top: 15, left: 70, width: 20, height: 4 },
                            total_amount: {
                              top: 80,
                              left: 70,
                              width: 20,
                              height: 6,
                            },
                            tax_amount: {
                              top: 75,
                              left: 70,
                              width: 20,
                              height: 4,
                            },
                          };
                          setActiveHighlight(mockCoords[field] || null);
                        }}
                      />
                      <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-end gap-12">
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Verification Status
                          </p>
                          <div className="flex gap-4">
                            <Badge
                              variant={
                                verifiedFields.has("date")
                                  ? "success"
                                  : "default"
                              }
                              className="text-[9px]"
                            >
                              DATE {verifiedFields.has("date") ? "✓" : "○"}
                            </Badge>
                            <Badge
                              variant={
                                verifiedFields.has("total_amount")
                                  ? "success"
                                  : "default"
                              }
                              className="text-[9px]"
                            >
                              TOTAL{" "}
                              {verifiedFields.has("total_amount") ? "✓" : "○"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setData(null);
                              setStatus("idle");
                              setFilePreviewUrl(null);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-[0.2em]"
                          >
                            Discard
                          </button>
                          <Button
                            onClick={handleApprove}
                            disabled={
                              !verifiedFields.has("date") ||
                              !verifiedFields.has("total_amount")
                            }
                            className={cn(
                              "shadow-[0_0_25px_rgba(14,165,233,0.3)] bg-sky-500 hover:bg-sky-400 text-white font-black",
                              (!verifiedFields.has("date") ||
                                !verifiedFields.has("total_amount")) &&
                                "opacity-50 cursor-not-allowed grayscale",
                            )}
                          >
                            <Save className="w-4 h-4 mr-2" /> APPROVE & SYNC
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            )}
            {status === "error" && errorMessage && (
              <Toast
                message={errorMessage}
                onRetry={
                  lastFile ? () => handleFileSelect(lastFile) : undefined
                }
                onClose={() => {
                  setStatus("idle");
                  setErrorMessage(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

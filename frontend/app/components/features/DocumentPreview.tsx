"use client";

import React, { useState } from "react";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2";
import { cn } from "../../utils";

interface DocumentPreviewProps {
    fileUrl: string | null;
    fileName?: string;
    activeHighlight?: { top: number; left: number; width: number; height: number } | null;
}

export const DocumentPreview = ({ fileUrl, fileName, activeHighlight }: DocumentPreviewProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isPdf = fileName?.toLowerCase().endsWith(".pdf");

    if (!fileUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Maximize2 className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">No document preview available</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-500",
            isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "h-[calc(100vh-200px)] sticky top-24"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[200px]">
                    {fileName || "Document Preview"}
                </span>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>

            {/* Content View */}
            <div className="relative w-full h-full overflow-auto bg-slate-950 flex justify-center p-4">
                {isPdf ? (
                    <iframe
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full min-h-[600px] border-none rounded-lg"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="relative inline-block">
                        <img
                            src={fileUrl}
                            alt="Invoice Preview"
                            className="max-w-full h-auto rounded-lg shadow-xl"
                        />

                        {/* Mock Highlight Overlay */}
                        {activeHighlight && (
                            <div
                                className="absolute border-2 border-sky-500 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.5)] rounded-sm animate-pulse z-10 transition-all duration-300"
                                style={{
                                    top: `${activeHighlight.top}%`,
                                    left: `${activeHighlight.left}%`,
                                    width: `${activeHighlight.width}%`,
                                    height: `${activeHighlight.height}%`,
                                }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Zoom Controls (Mock) */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-xl shadow-xl flex gap-1">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 font-bold">+</button>
                    <div className="w-px bg-slate-800 h-6 my-auto mx-1" />
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 font-bold">-</button>
                </div>
            </div>
        </div>
    );
};

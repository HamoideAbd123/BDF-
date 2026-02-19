"use client";

import React, { useState } from "react";
import Upload from "lucide-react/dist/esm/icons/upload";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { cn } from "../../utils";
import { type ProcessingStatus } from "../../services";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    status: ProcessingStatus;
}

export const UploadZone = ({ onFileSelect, status }: UploadZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300",
                isDragging ? "border-sky-500 bg-sky-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-900/50",
                (status !== "idle" && status !== "error") && "pointer-events-none opacity-50"
            )}
            onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,image/*";
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) onFileSelect(file);
                };
                input.click();
            }}
        >
            <div className="flex flex-col items-center text-center">
                <div className={cn(
                    "p-4 rounded-full mb-4 transition-transform duration-300",
                    isDragging ? "scale-110 bg-sky-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-sky-400"
                )}>
                    {(status === "uploading" || status === "processing") ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-1">
                    {status === "idle" ? "Drop invoice here" : status === "uploading" ? "Uploading..." : "Processing File..."}
                </h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    Support PDF, PNG, and JPEG. Max file size 10MB.
                </p>
            </div>
        </div>
    );
};

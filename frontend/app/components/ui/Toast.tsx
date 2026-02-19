"use client";

import React, { useEffect } from "react";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import X from "lucide-react/dist/esm/icons/x";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import { cn } from "../../utils";

interface ToastProps {
    message: string;
    type?: "error" | "info" | "success";
    onRetry?: () => void;
    onClose: () => void;
}

export const Toast = ({ message, type = "error", onRetry, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!onRetry) onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose, onRetry]);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
            <div className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px]",
                type === "error" ? "bg-rose-950/40 border-rose-500/30 text-rose-200" : "bg-slate-900/40 border-slate-700/30 text-slate-200"
            )}>
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    type === "error" ? "bg-rose-500/20 text-rose-400" : "bg-sky-500/20 text-sky-400"
                )}>
                    <AlertCircle className="w-5 h-5" />
                </div>

                <div className="flex-1 mr-4">
                    <p className="text-sm font-medium leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center gap-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="bg-rose-500 hover:bg-rose-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> RE-PROCESS
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

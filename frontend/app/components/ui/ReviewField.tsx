import React from "react";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import { cn } from "../../utils";
import { ExtractedField } from "../../services";

interface ReviewFieldProps {
    label?: string;
    field: ExtractedField<any>;
    onChange: (newValue: any) => void;
    onFocus?: () => void;
    type?: string;
    className?: string;
    isFlagged?: boolean;
}

export const ReviewField = ({ label, field, onChange, onFocus, type = "text", className, isFlagged }: ReviewFieldProps) => {
    const isLowConfidence = field.confidence < 0.7 && field.source === "ai";
    const isEdited = field.source === "human";

    return (
        <div className={cn("flex flex-col gap-1.5 w-full group", className)}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {label}
                    </label>
                    {isLowConfidence && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Low Confidence
                        </span>
                    )}
                    {isEdited && (
                        <span className="flex items-center gap-1 text-[10px] text-sky-500 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                    )}
                </div>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={field.value}
                    onFocus={onFocus}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "w-full bg-slate-950 border text-sm rounded-lg px-3 py-2.5 transition-all outline-none",
                        isFlagged
                            ? "border-rose-500/50 bg-rose-500/5 text-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                            : isLowConfidence
                                ? "border-amber-500/50 bg-amber-500/5 text-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                                : isEdited
                                    ? "border-sky-500/30 bg-sky-500/5 text-slate-100 focus:border-sky-500"
                                    : "border-slate-800 text-slate-300 hover:border-slate-700 focus:border-sky-500/50 focus:bg-slate-900/50"
                    )}
                />
                {isFlagged && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                    </div>
                )}
                {!isFlagged && isLowConfidence && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    </div>
                )}
            </div>
        </div>
    );
};

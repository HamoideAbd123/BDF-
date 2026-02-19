import React from "react";
import { cn } from "../../utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error";
    className?: string;
}

export const Badge = ({ children, variant = "default", className }: BadgeProps) => {
    const styles = {
        default: "bg-slate-800 text-slate-300",
        success: "bg-emerald-950 text-emerald-400 border border-emerald-900/50",
        warning: "bg-amber-950 text-amber-400 border border-amber-900/50",
        error: "bg-rose-950 text-rose-400 border border-rose-900/50",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap", styles[variant], className)}>
            {children}
        </span>
    );
};

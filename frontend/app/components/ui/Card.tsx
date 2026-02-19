import React from "react";
import { cn } from "../../utils";

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("glass-card rounded-2xl overflow-hidden shadow-2xl transition-all duration-500", className)}>
        {children}
    </div>
);


export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-8 border-b border-white/5 bg-white/5 backdrop-blur-sm", className)}>
        {children}
    </div>
);


export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-8", className)}>
        {children}
    </div>
);

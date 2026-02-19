"use client";

import React from "react";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Clock from "lucide-react/dist/esm/icons/clock";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../utils";
import { type DashboardStats } from "../../services";

interface StatsCardsProps {
    stats: DashboardStats | null;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    const isGrowthPositive = stats ? stats.monthlyGrowth >= 0 : true;

    const items = [
        {
            label: "Total Spending",
            value: stats ? `$${stats.totalSpend.toLocaleString()}` : "$0",
            subtext: "Approved invoices",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Pending Reviews",
            value: stats ? stats.pendingReviews.toString() : "0",
            subtext: "Awaiting action",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Monthly Growth",
            value: stats ? `${stats.monthlyGrowth}%` : "0%",
            subtext: isGrowthPositive ? "Increase from last month" : "Decrease from last month",
            icon: isGrowthPositive ? TrendingUp : TrendingDown,
            color: isGrowthPositive ? "text-sky-500" : "text-rose-500",
            bg: isGrowthPositive ? "bg-sky-500/10" : "bg-rose-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, idx) => (
                <Card key={idx} className="relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl", item.bg, item.color)}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                            <h3 className="text-3xl font-black text-slate-100 mb-1">{item.value}</h3>
                            <p className="text-xs text-slate-500 font-medium">{item.subtext}</p>
                        </div>
                    </CardContent>

                    {/* Decorative Gradient */}
                    <div className={cn(
                        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                        item.bg
                    )} />
                </Card>
            ))}
        </div>
    );
};

"use client";

import React, { useState, useEffect } from "react";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { StatsCards } from "./StatsCards";
import { SpendingChart } from "./SpendingChart";
import { StatusChart } from "./StatusChart";
import { InvoicesTable } from "./InvoicesTable";
import {
    DashboardService,
    type DashboardStats,
    type DashboardInvoice,
    type ChartData
} from "../../services";

export const InsightsDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [invoices, setInvoices] = useState<DashboardInvoice[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [s, inv, c, sd] = await Promise.all([
                    DashboardService.getStats(),
                    DashboardService.getInvoices(),
                    DashboardService.getChartData(),
                    DashboardService.getStatusDistribution()
                ]);
                setStats(s);
                setInvoices(inv);
                setChartData(c);
                setStatusData(sd);
            } catch (err) {

                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase animate-pulse">
                    Aggregating Financial Intelligence...
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                        <LayoutGrid className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest">Insights Overview</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time ledger analytics</p>
                    </div>
                </div>

                <button className="flex items-center gap-2 group text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                    Detailed Reports
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Top Row: Stats */}
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SpendingChart data={chartData} />
                </div>

                <div className="h-full">
                    <StatusChart data={statusData} />
                </div>
            </div>


            {/* Bottom Row: Invoices Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Transaction History</h3>
                    <div className="h-px bg-slate-800 flex-1" />
                </div>
                <InvoicesTable invoices={invoices} />
            </div>
        </div>
    );
};

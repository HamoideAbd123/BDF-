"use client";

import React, { useState } from "react";
import Search from "lucide-react/dist/esm/icons/search";
import Download from "lucide-react/dist/esm/icons/download";
import Eye from "lucide-react/dist/esm/icons/eye";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Filter from "lucide-react/dist/esm/icons/filter";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { type DashboardInvoice, DashboardService } from "../../services";
import { cn } from "../../utils";

interface InvoicesTableProps {
    invoices: DashboardInvoice[];
}

export const InvoicesTable = ({ invoices }: InvoicesTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const filteredInvoices = invoices.filter(inv =>
        inv.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (startDate === "" || inv.date >= startDate) &&
        (endDate === "" || inv.date <= endDate)
    );

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await DashboardService.exportInvoices({
                vendor: searchTerm,
                start_date: startDate,
                end_date: endDate
            });
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-sky-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 outline-none invert dark:invert-0"
                        />
                        <div className="w-px h-4 bg-slate-800" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 outline-none invert dark:invert-0"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        isLoading={isExporting}
                        className="border border-slate-800 bg-slate-900/50 hover:bg-slate-800"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vendor</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {inv.vendor[0]}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-300">{inv.vendor}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                        {inv.date}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-200">
                                        {inv.currency} {inv.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={inv.status === "Approved" ? "success" : "warning"}>
                                            {inv.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredInvoices.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                            <Filter className="w-8 h-8 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-medium">No invoices found matching your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

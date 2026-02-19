"use client";

import React, { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/Input";
import { type InvoiceData, type LineItem } from "../../services";

interface DataTableProps {
    data: InvoiceData;
    onUpdate: (data: InvoiceData) => void;
}

export const DataTable = ({ data, onUpdate }: DataTableProps) => {
    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        const nextLineItems = data.line_items.map((item) => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === "quantity" || field === "unit_price") {
                    updated.amount = Number(updated.quantity) * Number(updated.unit_price);
                }
                return updated;
            }
            return item;
        });
        onUpdate({ ...data, line_items: nextLineItems });
    };

    const removeLineItem = (id: string) => {
        onUpdate({ ...data, line_items: data.line_items.filter((i) => i.id !== id) });
    };

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: "",
            quantity: 1,
            unit_price: 0,
            amount: 0
        };
        onUpdate({ ...data, line_items: [...data.line_items, newItem] });
    };

    const totals = useMemo(() => {
        const subtotal = data.line_items.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = data.tax_amount / (data.total_amount - data.tax_amount) || 0;
        const tax = subtotal * taxRate;
        return {
            subtotal,
            tax,
            total: subtotal + tax
        };
    }, [data]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Vendor Name" value={data.vendor_name} onChange={(v) => onUpdate({ ...data, vendor_name: v.target.value })} />
                <Input label="Invoice Number" value={data.invoice_number} onChange={(v) => onUpdate({ ...data, invoice_number: v.target.value })} />
                <Input label="Invoice Date" type="date" value={data.date} onChange={(v) => onUpdate({ ...data, date: v.target.value })} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left py-4 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="text-right py-4 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Qty</th>
                            <th className="text-right py-4 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Price</th>
                            <th className="text-right py-4 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Amount</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.line_items.map((item) => (
                            <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="py-3 px-2">
                                    <input
                                        className="w-full bg-transparent border-none text-slate-200 focus:outline-none text-sm"
                                        value={item.description}
                                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border-none text-right text-slate-200 focus:outline-none text-sm"
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <input
                                        type="number"
                                        className="w-full bg-transparent border-none text-right text-slate-200 focus:outline-none text-sm"
                                        value={item.unit_price}
                                        onChange={(e) => updateLineItem(item.id, "unit_price", e.target.value)}
                                    />
                                </td>
                                <td className="py-3 px-2 text-right text-sm font-medium text-slate-300">
                                    {data.currency} {item.amount.toFixed(2)}
                                </td>
                                <td className="py-3 px-2">
                                    <button onClick={() => removeLineItem(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={addLineItem}
                    className="mt-4 flex items-center gap-2 text-sm text-sky-500 hover:text-sky-400 font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add line item
                </button>
            </div>

            <div className="flex flex-col items-end gap-3 pt-6 border-t border-slate-800">
                <div className="flex justify-between w-full max-w-xs text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-300 font-medium">{data.currency} {totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-xs text-sm">
                    <span className="text-slate-500">Estimated Tax</span>
                    <span className="text-slate-300 font-medium">{data.currency} {totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-xs pt-3 border-t border-slate-800 mt-2">
                    <span className="text-slate-200 font-semibold">Total</span>
                    <span className="text-sky-500 text-xl font-bold">{data.currency} {totals.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

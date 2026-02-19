"use client";

import React from "react";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import { ReviewField } from "../ui/ReviewField";
import { ReviewInvoiceData, ReviewLineItem, ExtractedField } from "../../services";
import { cn } from "../../utils";

interface ReviewTableProps {
    data: ReviewInvoiceData;
    onUpdate: (data: ReviewInvoiceData | null) => void;
    onFieldFocus?: (fieldKey: string) => void;
}

export const ReviewTable = ({ data, onUpdate, onFieldFocus }: ReviewTableProps) => {
    const updateField = <T,>(key: keyof ReviewInvoiceData, newValue: T) => {
        const field = data[key] as ExtractedField<T>;
        onUpdate({
            ...data,
            [key]: {
                ...field,
                value: newValue,
                source: "human",
                original_value: field.source === "ai" ? field.value : field.original_value,
            },
        });
    };

    const updateLineItem = (id: string, fieldKey: keyof ReviewLineItem, newValue: any) => {
        const nextLines = data.line_items.map((item) => {
            if (item.id === id) {
                const field = item[fieldKey] as ExtractedField<any>;
                const updatedField = {
                    ...field,
                    value: newValue,
                    source: "human",
                    original_value: field.source === "ai" ? field.value : field.original_value,
                };
                const updatedItem = { ...item, [fieldKey]: updatedField };

                // Recalculate amount if qty/price changed
                if (fieldKey === "quantity" || fieldKey === "unit_price") {
                    updatedItem.amount = {
                        ...updatedItem.amount,
                        value: Number(updatedItem.quantity.value) * Number(updatedItem.unit_price.value),
                        source: "human"
                    };
                }
                return updatedItem;
            }
            return item;
        });
        onUpdate({ ...data, line_items: nextLines });
    };

    const hasLowConfidence = Object.values(data).some(f => (f as any).confidence < 0.7) ||
        data.line_items.some(l => Object.values(l).some(f => (f as any).confidence < 0.7));

    return (
        <div className="space-y-10">
            {hasLowConfidence && (
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <p className="text-sm text-amber-200/80">
                        Some fields were extracted with <span className="font-bold text-amber-500">low confidence</span>. Please verify the highlighted items.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ReviewField
                    label="Vendor"
                    field={data.vendor_name}
                    onChange={(v) => updateField("vendor_name", v)}
                    onFocus={() => onFieldFocus?.("vendor_name")}
                    isFlagged={data.validation?.reasons.some(r => r.toLowerCase().includes("vendor"))}
                />
                <ReviewField
                    label="Invoice #"
                    field={data.invoice_number}
                    onChange={(v) => updateField("invoice_number", v)}
                    onFocus={() => onFieldFocus?.("invoice_number")}
                />
                <ReviewField
                    label="Date"
                    type="date"
                    field={data.date}
                    onChange={(v) => updateField("date", v)}
                    onFocus={() => onFieldFocus?.("date")}
                    isFlagged={data.validation?.reasons.some(r => r.toLowerCase().includes("date"))}
                />
            </div>

            <div className="overflow-hidden border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-800">
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24 text-right">Qty</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32 text-right">Price</th>
                            <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32 text-right">Total</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.line_items.map((item) => (
                            <tr key={item.id} className="group hover:bg-slate-900/30 transition-colors">
                                <td className="p-2">
                                    <ReviewField
                                        field={item.description}
                                        onChange={(v) => updateLineItem(item.id, "description", v)}
                                        onFocus={() => onFieldFocus?.("line_item_description")}
                                    />
                                </td>
                                <td className="p-2">
                                    <ReviewField
                                        field={item.quantity}
                                        type="number"
                                        onChange={(v) => updateLineItem(item.id, "quantity", v)}
                                        onFocus={() => onFieldFocus?.("line_item_quantity")}
                                        className="text-right"
                                    />
                                </td>
                                <td className="p-2">
                                    <ReviewField
                                        field={item.unit_price}
                                        type="number"
                                        onChange={(v) => updateLineItem(item.id, "unit_price", v)}
                                        onFocus={() => onFieldFocus?.("line_item_unit_price")}
                                        className="text-right"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-semibold text-slate-300">
                                    {data.currency} {item.amount.value.toFixed(2)}
                                </td>
                                <td className="px-4">
                                    <button className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col items-end gap-2 pt-6">
                <div className="flex justify-between w-64 text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-300">{data.currency} {data.total_amount.value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 pt-4 border-t border-slate-800 mt-2">
                    <span className="text-slate-200 font-bold uppercase tracking-widest text-xs">Final Amount</span>
                    <span className="text-sky-500 font-black text-2xl">{data.currency} {data.total_amount.value.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

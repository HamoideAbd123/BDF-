export interface InvoiceData {
    invoice_number: string;
    date: string;
    vendor_name: string;
    total_amount: number;
    tax_amount: number;
    currency: string;
    line_items: LineItem[];
}

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export interface ExtractedField<T = string | number> {
    value: T;
    confidence: number; // 0 to 1
    source: "ai" | "human";
    original_value?: T;
}

export interface ReviewLineItem {
    id: string;
    description: ExtractedField<string>;
    quantity: ExtractedField<number>;
    unit_price: ExtractedField<number>;
    amount: ExtractedField<number>;
}

export interface ReviewInvoiceData {
    document_id?: number;
    invoice_id?: number;
    invoice_number: ExtractedField<string>;
    date: ExtractedField<string>;
    vendor_name: ExtractedField<string>;
    total_amount: ExtractedField<number>;
    tax_amount: ExtractedField<number>;
    currency: string;
    line_items: ReviewLineItem[];
    validation?: {
        status: "valid" | "invalid";
        reasons: string[];
    };
    isVerified?: boolean;
}

export type ProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ReviewService {
    static async upload(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const { task_id } = await res.json();
        return task_id;
    }

    static async submitReview(data: ReviewInvoiceData): Promise<void> {
        const auditLog = {
            timestamp: new Date().toISOString(),
            changes: this.extractChanges(data),
        };

        await fetch(`${API_BASE_URL}/invoice/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, auditLog }),
        });
    }

    static async getTaskStatus(taskId: string): Promise<{ status: "processing" | "completed" | "failed"; data?: any; error?: string }> {
        const res = await fetch(`${API_BASE_URL}/result/${taskId}`);
        if (!res.ok) throw new Error("Failed to check status");
        return res.json();
    }

    private static extractChanges(data: ReviewInvoiceData) {
        const changes: any[] = [];
        const check = (key: string, field: ExtractedField<any>) => {
            if (field.source === "human") {
                changes.push({ field: key, from: field.original_value, to: field.value });
            }
        };

        check("vendor", data.vendor_name);
        check("number", data.invoice_number);
        check("date", data.date);
        check("total", data.total_amount);

        return changes;
    }
}

export interface DashboardStats {
    totalSpend: number;
    pendingReviews: number;
    monthlyGrowth: number;
}

export interface DashboardInvoice {
    id: number;
    vendor: string;
    date: string;
    total: number;
    currency: string;
    status: "Approved" | "Pending Review";
}

export interface ChartData {
    name: string;
    spend: number;
}

export class DashboardService {
    static async getStats(): Promise<DashboardStats> {
        const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
    }

    static async getInvoices(params?: {
        vendor?: string;
        start_date?: string;
        end_date?: string;
    }): Promise<DashboardInvoice[]> {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_BASE_URL}/dashboard/invoices?${query}`);
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
    }

    static async getChartData(): Promise<ChartData[]> {
        const res = await fetch(`${API_BASE_URL}/dashboard/chart`);
        if (!res.ok) throw new Error("Failed to fetch chart data");
        return res.json();
    }

    static async getStatusDistribution(): Promise<{ name: string; value: number; color: string }[]> {
        const res = await fetch(`${API_BASE_URL}/dashboard/status-distribution`);
        if (!res.ok) throw new Error("Failed to fetch status distribution");
        return res.json();
    }

    static async exportInvoices(params?: {
        vendor?: string;
        start_date?: string;
        end_date?: string;
    }): Promise<void> {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_BASE_URL}/dashboard/export?${query}`);
        if (!res.ok) throw new Error("Failed to export invoices");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "invoices_export.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}


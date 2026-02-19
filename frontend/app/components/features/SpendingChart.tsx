"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Card, CardHeader, CardContent } from "../ui/Card";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import { type ChartData } from "../../services";

interface SpendingChartProps {
    data: ChartData[];
}

export const SpendingChart = ({ data }: SpendingChartProps) => {
    return (
        <Card className="h-full">
            <CardHeader className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-500" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Spending Trends</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Last 6 Months
                </div>
            </CardHeader>
            <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#f1f5f9'
                            }}
                            itemStyle={{ color: '#0ea5e9' }}
                        />
                        <Bar
                            dataKey="spend"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === data.length - 1 ? '#0ea5e9' : '#334155'}
                                    fillOpacity={index === data.length - 1 ? 1 : 0.5}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

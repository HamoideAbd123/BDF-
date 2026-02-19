"use client";

import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import { Card, CardHeader, CardContent } from "../ui/Card";
import PieChartIcon from "lucide-react/dist/esm/icons/pie-chart";

interface StatusChartProps {
    data: { name: string; value: number; color: string }[];
}

export const StatusChart = ({ data }: StatusChartProps) => {
    return (
        <Card className="h-full">
            <CardHeader className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Verification Status</h3>
                </div>
            </CardHeader>
            <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#f1f5f9'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                paddingTop: '20px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

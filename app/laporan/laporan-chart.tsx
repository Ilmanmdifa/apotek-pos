"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "@/lib/laporan";

function shortRp(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
  if (v >= 1000) return `${Math.round(v / 1000)}rb`;
  return String(v);
}

export function LaporanChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={shortRp}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => [
              new Intl.NumberFormat("id-ID").format(Number(v)),
              "Omzet (Rp)",
            ]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="omzet"
            stroke="#0891B2"
            fill="#0891B2"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

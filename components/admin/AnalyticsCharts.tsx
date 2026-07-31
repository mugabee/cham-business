"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const BRAND = "#2563b8";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <h2 className="font-semibold text-ink mb-4">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function AnalyticsCharts({
  newLoans,
  portfolioValue,
  collectionRate,
  overdueAging,
}: {
  newLoans: { month: string; value: number }[];
  portfolioValue: { month: string; value: number }[];
  collectionRate: { month: string; value: number }[];
  overdueAging: { label: string; value: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="New loans over time">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={newLoans}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Loans" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Portfolio value (approx., RWF)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={portfolioValue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="value" name="Portfolio value" stroke={BRAND} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Collection rate by month (%)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={collectionRate}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip />
            <Bar dataKey="value" name="Collection rate" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Overdue aging (RWF)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overdueAging}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" name="Overdue" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

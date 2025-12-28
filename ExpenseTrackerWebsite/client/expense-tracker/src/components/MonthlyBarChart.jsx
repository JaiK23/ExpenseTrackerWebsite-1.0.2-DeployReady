import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));

function MonthlyBarChart({ expenses = [], months = 6 }) {
  const now = new Date();
  const monthKeys = [...Array(months)].map((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short" }),
    };
  });

  const buckets = monthKeys.map((m) => ({
    ...m,
    total: 0,
  }));

  expenses.forEach((e) => {
    const date = e.date ? new Date(e.date) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.total += Number(e.amount || 0);
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Monthly Spend</h3>
          <p className="text-sm text-gray-500 mt-1">Last {months} months</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={buckets}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip formatter={(value) => [formatCurrency(value), "Spent"]} />
          <Bar dataKey="total" fill="#6366F1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyBarChart;

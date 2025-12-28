import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function SpendingChart({ expenses = [] }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  // Last 7 days [oldest -> newest]
  const last7days = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().split("T")[0];
  });

  const chartData = last7days.map((date) => {
    const dayExpenses = expenses.filter((e) => {
      const d = e.date ? String(e.date).split("T")[0] : "";
      return d === date;
    });

    const totalAmount = dayExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    return {
      date: new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
      }),
      amount: Number(totalAmount.toFixed(2)),
    };
  });

  const tooltipStyles = {
    backgroundColor: "var(--card)",
    borderColor: "var(--card-border)",
    color: "var(--text)",
    borderRadius: 12,
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    padding: "10px 12px",
  };

  const tooltipLabelStyle = {
    color: "var(--text)",
    fontWeight: 700,
  };

  const tooltipItemStyle = {
    color: "var(--text)",
    fontWeight: 600,
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Weekly Spending</h3>
          <p className="text-sm text-gray-500 mt-1">Last 7 days trend</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient
              id="lineGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            fontSize={12}
          />

          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
          />

          <Tooltip
            formatter={(value) => [formatCurrency(value), "Spent"]}
            contentStyle={tooltipStyles}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
          />

          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#lineGradient)"
            strokeWidth={4}
            dot={{
              fill: "#6366F1",
              r: 5,
              strokeWidth: 3,
              stroke: "#fff",
            }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;

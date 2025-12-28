import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F97316",
  "#0EA5E9",
  "#A855F7",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

function CategoryChart({ categoryTotals = {} }) {
  const data = Object.entries(categoryTotals).map(
    ([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    })
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Category Distribution
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value),
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.length === 0 && (
          <p className="text-xs text-gray-500 col-span-2">
            No category data yet.
          </p>
        )}
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-xs font-semibold text-gray-700">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;

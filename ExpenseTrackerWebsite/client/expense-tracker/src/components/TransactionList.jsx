import React from "react";
import {
  Edit2,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";

function TransactionList({
  expenses = [],
  onEditExpense,
  onDeleteExpense,
}) {
  const hasExpenses = expenses.length > 0;
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Transactions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {hasExpenses
              ? `${expenses.length} expense(s)`
              : "No transactions"}
          </p>
        </div>
        <div className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-bold">
          Summary
        </div>
      </div>

      {/* Search & Filter UI (non-functional placeholder) */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
          <option>Category</option>
        </select>
      </div>

      {/* If no expenses */}
      {!hasExpenses && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">
            No transactions found
          </p>
          <p className="text-gray-500 text-sm">
            Try adding a new expense.
          </p>
        </div>
      )}

      {/* Expenses list */}
      {hasExpenses && (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-xl"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-bold text-gray-900 truncate">
                    {expense.description || "Expense"}
                  </h4>
                  <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-700">
                    {expense.category || "Other"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 font-medium">
                    {expense.date || "No date"}
                  </span>

                  {expense.note && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {expense.note}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => onEditExpense && onEditExpense(expense)}
                  className="p-2.5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-sm"
                >
                  <Edit2
                    className="w-4 h-4"
                    strokeWidth={2.5}
                  />
                </button>

                <button
                  onClick={() =>
                    onDeleteExpense && onDeleteExpense(expense._id)
                  }
                  className="p-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all shadow-sm"
                >
                  <Trash2
                    className="w-4 h-4"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;

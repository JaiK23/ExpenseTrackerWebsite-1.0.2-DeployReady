import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Plus, ShieldCheck, Trophy, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import CategoryChart from "../components/CategoryChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import TransactionList from "../components/TransactionList";
import Model from "../components/Model";
import {
  fetchExpenses,
  createExpenses,
  updateExpenses,
  deleteExpenses,
  fetchGamifySummary,
  fetchGamifyTasks,
  completeTask,
  downloadReport,
} from "../api";
import { useAuth } from "../authContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const calculateStats = (expenseList) => {
  const list = Array.isArray(expenseList) ? expenseList : [];
  const total = list.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const categoryTotals = list.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  const highest =
    list.length > 0
      ? Math.max(...list.map((e) => Number(e.amount || 0)))
      : 0;

  return {
    total,
    count: list.length,
    avg: list.length ? total / list.length : 0,
    highest,
    categoryTotals,
  };
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const expData = await fetchExpenses();
        const normalized = (expData || []).map((e) => ({
          ...e,
          date: e?.date
            ? String(e.date).split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));
        setExpenses(normalized);
        setTasks(await fetchGamifyTasks());
        setProgress(await fetchGamifySummary());
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => calculateStats(expenses), [expenses]);

  // Add new expense
  const handleAddExpense = async (expenseData) => {
    try {
      const created = await createExpenses(expenseData);
      if (!created) throw new Error("No created expense returned");

      const normalized = {
        ...created,
        date: created.date
          ? String(created.date).split("T")[0]
          : new Date().toISOString().split("T")[0],
      };

      setExpenses((prev) => [normalized, ...prev]);
      setModalOpen(false);
      setProgress(await fetchGamifySummary());
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense");
    }
  };

  // Begin editing
  const onEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  // Save edited expense
  const handleSaveEdit = async (payload) => {
    if (!editingExpense) return;
    try {
      const updated = await updateExpenses(editingExpense._id, payload);
      const normalized = {
        ...updated,
        date: updated.date
          ? String(updated.date).split("T")[0]
          : new Date().toISOString().split("T")[0],
      };

      setExpenses((prev) =>
        prev.map((e) => (e._id === normalized._id ? normalized : e))
      );

      setEditingExpense(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Error updating expense");
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      await deleteExpenses(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense");
    }
  };

  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      setProgress(await fetchGamifySummary());
    } catch (err) {
      alert(err?.response?.data?.message || "Task already completed.");
    }
  };

  const handleDownloadReport = async () => {
    const blob = await downloadReport();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses-report-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg dark:bg-slate-900 dark:border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 lg:text-4xl mb-1 dark:text-gray-100">
              Expense Tracker
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome back, {user?.name || "friend"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNewExpense}
              className="px-4 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Report
            </button>
            <Link
              to="/settings"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:shadow-lg transition dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700"
            >
              Settings
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/40 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200">
            Loading expenses...
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          <StatCard
            value={formatCurrency(stats.total)}
            title="Total Spent"
            icon={Wallet}
            subtitle="All time"
            bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
            iconColor="bg-indigo-700"
          />

          <StatCard
            icon={Trophy}
            title="Expenses"
            value={stats.count}
            subtitle={`${stats.count} transactions`}
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            iconColor="bg-purple-700"
          />

          <StatCard
            value={formatCurrency(stats.avg)}
            title="Average Spend"
            icon={Plus}
            subtitle="Per expense"
            bgColor="bg-gradient-to-br from-pink-500 to-pink-600"
            iconColor="bg-pink-700"
          />

          <StatCard
            value={formatCurrency(stats.highest)}
            title="Highest Spent"
            icon={Wallet}
            subtitle="Single expense"
            bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
            iconColor="bg-indigo-700"
          />
        </div>

        {/* Gamify & progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Karma</h3>
              <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold">
                Level {progress?.level || 1}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {progress?.karma || 0} pts
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Earn points from spending and tasks.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Daily / Weekly / Monthly quests
              </h3>
              <Link to="/reports" className="text-indigo-600 text-sm font-semibold">
                Reports &raquo;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white transition"
                >
                  <p className="text-xs uppercase text-gray-500 font-bold mb-1">
                    {task.type}
                  </p>
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-sm text-indigo-600 font-bold mt-2">
                    +{task.points} pts
                  </p>
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="mt-3 w-full py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  >
                    Complete
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-4">
          <div className="lg:col-span-3">
            <SpendingChart expenses={expenses} />
          </div>
          <div className="lg:col-span-2">
            <CategoryChart categoryTotals={stats.categoryTotals} />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <MonthlyBarChart expenses={expenses} months={6} />
        </div>

        {/* Transactions */}
        <TransactionList
          expenses={expenses}
          onEditExpense={onEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Model
          editingExpense={editingExpense}
          onClose={() => {
            setModalOpen(false);
            setEditingExpense(null);
          }}
          onSave={editingExpense ? handleSaveEdit : handleAddExpense}
        />
      )}
    </div>
  );
}

export default Dashboard;

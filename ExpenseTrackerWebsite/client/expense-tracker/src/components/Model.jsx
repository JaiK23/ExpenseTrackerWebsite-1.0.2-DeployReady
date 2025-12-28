import React, { useEffect, useState } from "react";
import { Calendar, IndianRupee, X } from "lucide-react";
import { scanReceipt } from "../api";

function Model({ editingExpense, onClose, onSave }) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    category: "Food",
    note: "",
  });
  const [uploading, setUploading] = useState(false);
  const [scanHint, setScanHint] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setForm({
        description: editingExpense.description || "",
        amount: editingExpense.amount || "",
        date: editingExpense.date || "",
        category: editingExpense.category || "Food",
        note: editingExpense.note || "",
      });
    } else {
      setForm({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Food",
        note: "",
      });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleScan = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setScanHint("Scanning receipt...");
    try {
      const res = await scanReceipt(file);
      if (res?.data) {
        setForm((f) => ({
          ...f,
          description: res.data.description || f.description,
          amount: res.data.amount || f.amount,
          date: res.data.date || f.date,
          category: res.data.category || f.category,
          note: res.data.note || f.note,
        }));
        setScanHint("Receipt parsed, review and save.");
      } else {
        setScanHint("Could not read receipt.");
      }
    } catch (err) {
      console.error(err);
      setScanHint("Scan failed. Try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) {
      alert("Please fill description, amount and date.");
      return;
    }
    onSave &&
      onSave({
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        note: form.note,
      });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your spending
            </p>
          </div>

          <button
            className="p-2 hover:bg-gray-200 rounded-full transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Scan receipt (OCR)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScan}
              disabled={uploading}
              className="w-full text-sm"
            />
            {scanHint && (
              <p className="text-xs text-gray-500 mt-1">{scanHint}</p>
            )}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              What did you buy?
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare", "Other"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, category: cat }))
                    }
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.category === cat
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Add notes"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
            >
              {editingExpense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Model;

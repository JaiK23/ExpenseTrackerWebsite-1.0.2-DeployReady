import React, { useState } from "react";
import { downloadReport } from "../api";

function Reports() {
  const [status, setStatus] = useState("");

  const handleDownload = async () => {
    setStatus("Generating...");
    try {
      const blob = await downloadReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expenses-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setStatus("Report downloaded.");
    } catch (_) {
      setStatus("Failed to generate report.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports</h1>
        <p className="text-sm text-gray-500 mb-6">
          Generate a PDF summary of your expenses and category breakdowns.
        </p>
        <button
          onClick={handleDownload}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Download PDF
        </button>
        {status && <p className="text-sm text-gray-600 mt-3">{status}</p>}
      </div>
    </div>
  );
}

export default Reports;

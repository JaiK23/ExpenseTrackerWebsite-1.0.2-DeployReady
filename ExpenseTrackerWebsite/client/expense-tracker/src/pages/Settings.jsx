import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSettings, updateSettings, deleteAccount } from "../api";
import { useAuth } from "../authContext";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [settings, setSettings] = useState({ theme: "light", notifications: true });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data || {});
        applyTheme(data?.theme);
      } catch (_) {
        setMessage("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleUpdate = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applyTheme(next.theme);
    if (typeof localStorage !== "undefined") {
      if (next.theme === "dark" || next.theme === "light") {
        localStorage.setItem("theme", next.theme);
      } else {
        localStorage.removeItem("theme");
      }
    }
    await updateSettings(next);
    setMessage("Settings saved");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete your account and expenses? This cannot be undone.");
    if (!confirmed) return;
    await deleteAccount();
    logout();
    navigate("/signup");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>
        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Theme</p>
              <p className="text-sm text-gray-500">Switch between light and dark mode.</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold bg-white text-gray-800 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Notifications</p>
              <p className="text-sm text-gray-500">Turn email/app notifications on or off.</p>
            </div>
            <button
              onClick={() => handleUpdate({ notifications: !settings.notifications })}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                settings.notifications ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {settings.notifications ? "On" : "Off"}
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-800 mb-2">Danger zone</p>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

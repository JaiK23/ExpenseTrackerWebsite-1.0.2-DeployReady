import axios from "axios";
// const BASE_URL = "http://localhost:8000/api";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";
let authToken =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("authToken")
    : null;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }
};

// Auth
export const signup = async (payload) => {
  const res = await api.post("/auth/signup", payload);
  setAuthToken(res.data.token);
  return res.data;
};

export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);
  setAuthToken(res.data.token);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};

// Expense APIs
export const fetchExpenses = async () => {
  const res = await api.get("/expenses");
  return (res.data && res.data.data) || [];
};

export const createExpenses = async (payload) => {
  const res = await api.post("/expenses", payload);
  return (res.data && res.data.data) || null;
};

export const updateExpenses = async (id, payload) => {
  const res = await api.put(`/expenses/${id}`, payload);
  return (res.data && res.data.data) || null;
};

export const deleteExpenses = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data || null;
};

// OCR
export const scanReceipt = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/ocr/receipt", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Gamify
export const fetchGamifyTasks = async () => {
  const res = await api.get("/gamify/tasks");
  return res.data.data;
};

export const fetchGamifySummary = async () => {
  const res = await api.get("/gamify/summary");
  return res.data.data;
};

export const completeTask = async (taskId) => {
  const res = await api.post("/gamify/complete", { taskId });
  return res.data.data;
};

// Settings
export const fetchSettings = async () => {
  const res = await api.get("/settings");
  return res.data.data;
};

export const updateSettings = async (payload) => {
  const res = await api.put("/settings", payload);
  return res.data.data;
};

export const deleteAccount = async () => {
  const res = await api.delete("/settings/account");
  setAuthToken(null);
  return res.data;
};

// Reports
export const downloadReport = async () => {
  const res = await api.get("/reports/pdf", { responseType: "blob" });
  return res.data;
};

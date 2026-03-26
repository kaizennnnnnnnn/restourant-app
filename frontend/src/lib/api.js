import axios from "axios";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE });

// Attach admin token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token && config.url?.startsWith("/admin")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Public ─────────────────────────────────────────────────────────

export const fetchMenu = () => api.get("/menu").then((r) => r.data);

export const fetchSettings = () =>
  api.get("/restaurant/settings").then((r) => r.data);

export const createOrder = (data) =>
  api.post("/orders", data).then((r) => r.data);

export const fetchOrder = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data);

// ─── Admin ──────────────────────────────────────────────────────────

export const adminLogin = (data) =>
  api.post("/admin/login", data).then((r) => r.data);

export const fetchAdminOrders = (status) =>
  api
    .get("/admin/orders", { params: status ? { status } : {} })
    .then((r) => r.data);

export const updateOrderStatus = (orderId, data) =>
  api.patch(`/admin/orders/${orderId}/status`, data).then((r) => r.data);

export const fetchAdminStats = () =>
  api.get("/admin/stats").then((r) => r.data);

export const updateSettings = (data) =>
  api.patch("/admin/settings", data).then((r) => r.data);

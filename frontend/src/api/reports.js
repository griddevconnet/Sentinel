import { apiClient } from "./client";

export const reportsApi = {
  submit: (payload) => apiClient.post("/reports", payload),
  getByToken: (token) => apiClient.get(`/reports/status/${encodeURIComponent(token)}`),
  getById: (id) => apiClient.get(`/reports/${id}`, { auth: true }),
  list: (query) => apiClient.get("/reports", { auth: true, query }),
};

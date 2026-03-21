import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getDashboardStats = async () => {
  // Ambil token dari storage karena rute ini butuh login
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/reports/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data; // Mengembalikan object { stats: ..., recent_transactions: ... }
};

import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Tambahkan parameter `date` (opsional)
export const getDashboardStats = async (
  filter: string = "today",
  customDate?: string,
) => {
  let url = `${API_URL}/reports/dashboard?filter=${filter}`;
  if (customDate) {
    url += `&date=${customDate}`;
  }
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};
export const exportDashboardExcel = async (
  filter: string = "today",
  customDate?: string,
) => {
  let url = `${API_URL}/reports/export-excel?filter=${filter}`;
  if (customDate) {
    url += `&date=${customDate}`;
  }

  // Perhatikan tambahan 'responseType: blob' ini sangat penting buat file!
  const response = await axios.get(url, {
    ...getAuthHeaders(),
    responseType: "blob",
  });
  return response.data;
};

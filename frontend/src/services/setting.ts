import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getSettings = async () => {
  const response = await axios.get(`${API_URL}/settings`, getAuthHeaders());
  return response.data;
};

// 👇 UBAH FUNGSI INI BIAR BISA NGIRIM GAMBAR 👇
export const updateSettings = async (data: any) => {
  const formData = new FormData();

  // Masukkan semua data teks ke FormData
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined && key !== "qris_image") {
      formData.append(key, data[key]);
    }
  });

  // Masukkan file gambar jika ada
  if (data.qris_image instanceof File) {
    formData.append("qris_image", data.qris_image);
  }

  // Trik khusus Laravel: Laravel sering nolak file gambar pakai method PUT, jadi kita pakai POST tapi dipaksa jadi PUT
  formData.append("_method", "PUT");

  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/settings`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Wajib untuk upload file
    },
  });
  return response.data;
};

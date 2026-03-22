import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Tambahkan parameter isMultipart untuk mode upload file
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
    },
  };
};

// --- API PRODUK ---
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`, getAuthHeaders());
  return response.data.data;
};

// Menggunakan FormData agar bisa bawa file gambar
export const addProduct = async (data: FormData) => {
  const response = await axios.post(
    `${API_URL}/products`,
    data,
    getAuthHeaders(true),
  );
  return response.data;
};

// Ingat, rute update di Laravel tadi sudah kita ubah jadi POST khusus buat nerima file
export const updateProduct = async (id: number, data: FormData) => {
  const response = await axios.post(
    `${API_URL}/products/${id}`,
    data,
    getAuthHeaders(true),
  );
  return response.data;
};

// FITUR BARU: Hapus Menu
export const deleteProduct = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/products/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

// FITUR BARU: Matikan/Nyalakan Menu
export const toggleProductStatus = async (id: number) => {
  const response = await axios.patch(
    `${API_URL}/products/${id}/status`,
    {},
    getAuthHeaders(),
  );
  return response.data;
};

export const bulkUpdateStock = async (
  stocks: { id: number; stock: number }[],
) => {
  const response = await axios.post(
    `${API_URL}/products/bulk-stock`,
    { stocks },
    getAuthHeaders(),
  );
  return response.data;
};

// FITUR BARU: Ambil Riwayat Stok (Logs)
export const getStockLogs = async () => {
  const response = await axios.get(`${API_URL}/stock-logs`, getAuthHeaders());
  return response.data.data;
};

// --- API KATEGORI ---
export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`, getAuthHeaders());
  return response.data.data;
};

export const addCategory = async (name: string) => {
  const response = await axios.post(
    `${API_URL}/categories`,
    { name },
    getAuthHeaders(),
  );
  return response.data;
};

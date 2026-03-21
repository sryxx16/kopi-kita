import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Biar gampang, kita bikin helper buat ngambil token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`, getAuthHeaders());
  return response.data.data;
};

// FUNGSI BARU: Nembak API buat nambah menu
export const addProduct = async (data: {
  name: string;
  price: number;
  category_id: number;
}) => {
  const response = await axios.post(
    `${API_URL}/products`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

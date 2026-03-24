import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

// 1. Kita tambahkan fungsi untuk mengambil "Kartu Identitas" (Token)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getExpenses = async () => {
  // 2. Selipkan tokennya di parameter kedua axios
  const response = await axios.get(`${BASE_URL}/expenses`, getAuthHeaders());
  return response.data;
};

export const createExpense = async (data: any) => {
  // 3. Selipkan tokennya di parameter ketiga axios (karena parameter kedua itu data/body)
  const response = await axios.post(
    `${BASE_URL}/expenses`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

export const deleteExpense = async (id: number) => {
  // 4. Selipkan tokennya di parameter kedua axios
  const response = await axios.delete(
    `${BASE_URL}/expenses/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

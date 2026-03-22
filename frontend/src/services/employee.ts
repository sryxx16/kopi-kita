import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getEmployees = async () => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
  return response.data.data; // Nyesuaikan respon backend kita
};

export const addEmployee = async (data: {
  name: string;
  email: string;
  password?: string;
  role: string;
}) => {
  const response = await axios.post(`${API_URL}/users`, data, getAuthHeaders());
  return response.data;
};

// FITUR BARU: EDIT DATA KARYAWAN
export const updateEmployee = async (
  id: number,
  data: { name: string; email: string; password?: string; role: string },
) => {
  const response = await axios.put(
    `${API_URL}/users/${id}`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

// FITUR BARU: HAPUS KARYAWAN
export const deleteEmployee = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/users/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

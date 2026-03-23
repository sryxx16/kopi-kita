import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getInventory = async () => {
  const response = await axios.get(`${API_URL}/inventory`, getAuthHeaders());
  return response.data;
};

export const addInventory = async (data: any) => {
  const response = await axios.post(
    `${API_URL}/inventory`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

export const updateInventory = async (id: number, data: any) => {
  const response = await axios.put(
    `${API_URL}/inventory/${id}`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

export const deleteInventory = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/inventory/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

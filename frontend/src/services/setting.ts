import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getSettings = async () => {
  const response = await axios.get(`${API_URL}/settings`, getAuthHeaders());
  return response.data;
};

export const updateSettings = async (data: any) => {
  const response = await axios.put(
    `${API_URL}/settings`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

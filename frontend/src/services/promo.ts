import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getPromos = async () => {
  const response = await axios.get(`${API_URL}/promos`, getAuthHeaders());
  return response.data;
};

export const addPromo = async (data: any) => {
  const response = await axios.post(
    `${API_URL}/promos`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

export const updatePromo = async (id: number, data: any) => {
  const response = await axios.put(
    `${API_URL}/promos/${id}`,
    data,
    getAuthHeaders(),
  );
  return response.data;
};

export const deletePromo = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/promos/${id}`,
    getAuthHeaders(),
  );
  return response.data;
};

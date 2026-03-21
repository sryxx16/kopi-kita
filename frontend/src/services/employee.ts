import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getEmployees = async () => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
  return response.data.data;
};

export const addEmployee = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/users`, data, getAuthHeaders());
  return response.data;
};

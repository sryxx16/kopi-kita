import axios from "axios";

// Sesuaikan URL ini jika Laragon Anda menggunakan domain lokal seperti http://backend.test
const API_URL = "http://localhost:8000/api";

export const loginAPI = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  // Jika ada token dari Laravel, simpan ke Local Storage browser
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

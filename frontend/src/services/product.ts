import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getProducts = async () => {
  // Memanggil endpoint yang tadi Anda tes di browser
  const response = await axios.get(`${API_URL}/products`);
  return response.data.data; // Mengambil array produk dari dalam object response
};

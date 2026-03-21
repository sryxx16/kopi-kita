import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const checkout = async (items: any[], amountPaid: number) => {
  // Kita ambil token dari localStorage biar API tau siapa kasir yang lagi jaga
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/transactions`,
    { items, amount_paid: amountPaid },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

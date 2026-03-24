import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const checkout = async (
  items: any[],
  amountPaid: number,
  totalPrice: number,
  paymentMethod: string,
  discountAmount: number = 0,
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/transactions`,
      {
        items,
        amount_paid: amountPaid,
        total_price: totalPrice,
        payment_method: paymentMethod,
        discount_amount: discountAmount, // 👇 KIRIM KE BACKEND
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "Terjadi kesalahan saat memproses transaksi";

    console.error("Checkout Error Details:", {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });

    throw new Error(errorMessage);
  }
};

export const voidTransaction = async (id: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `http://localhost:8000/api/transactions/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

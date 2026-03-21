<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi keranjang belanja dari React
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'amount_paid' => 'required|numeric|min:0',
        ]);

        try {
            // 2. MULAI DATABASE TRANSACTION (Penting! Agar data aman kalau ada error)
            DB::beginTransaction();

            $totalPrice = 0;
            $details = [];

            // 3. Hitung harga ASLI dari database, jangan pakai harga kiriman frontend
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $totalPrice += $subtotal;

                // Tampung dulu data detailnya
                $details[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            // 4. Cek apakah uang bayar cukup
            if ($request->amount_paid < $totalPrice) {
                return response()->json(['message' => 'Uang pembayaran kurang!'], 400);
            }

            $change = $request->amount_paid - $totalPrice;

            // 5. Simpan ke tabel Induk (transactions)
            $transaction = Transaction::create([
                // Kita hardcode user_id 1 dulu untuk testing awal, nanti bisa pakai Auth::id()
                'user_id' => 1,
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'total_price' => $totalPrice,
                'amount_paid' => $request->amount_paid,
                'change' => $change,
            ]);

            // 6. Simpan ke tabel Detail (transaction_details)
            foreach ($details as $detail) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'subtotal' => $detail['subtotal'],
                ]);
            }

            // 7. JIKA SEMUA BERHASIL, SIMPAN PERMANEN!
            DB::commit();

            return response()->json([
                'message' => 'Transaksi Berhasil!',
                'invoice' => $transaction->invoice_number,
                'kembalian' => $change
            ], 201);

        } catch (\Exception $e) {
            // JIKA ADA ERROR DI TENGAH JALAN, BATALKAN SEMUA SIMPANAN! (Rollback)
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memproses transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

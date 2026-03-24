<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\StockLog;

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
            'total_price' => 'required|numeric|min:0',
            // 👇 TAMBAHIN INI
            'payment_method' => 'required|string',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            // 2. MULAI DATABASE TRANSACTION (Penting! Agar data aman kalau ada error)
            DB::beginTransaction();

            // Gunakan total_price dari frontend (sudah termasuk diskon & tax)
            $totalPrice = $request->total_price;
            $details = [];

            // 3. Simpan detail items (untuk invoice & stock tracking)
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];

                // Tampung dulu data detailnya
                $details[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                    // 👇 TAMBAHKAN INI: Tarik harga modal dari database master produk
                    'cost_price' => $product->cost_price ?? 0,
                ];
            }

            // 4. Cek apakah uang bayar cukup (dengan total_price dari frontend yang sudah include diskon)
            if ($request->amount_paid < $totalPrice) {
                return response()->json(['message' => 'Uang pembayaran kurang!'], 400);
            }

            $change = $request->amount_paid - $totalPrice;

            // 5. Simpan ke tabel Induk (transactions)
            $transaction = Transaction::create([
                'user_id' => 1,
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'total_price' => $totalPrice,
                'amount_paid' => $request->amount_paid,
                'change' => $change,
                // 👇 TAMBAHIN INI: Simpan metode bayarnya
                'payment_method' => $request->payment_method,
                'discount_amount' => $request->discount_amount ?? 0,
            ]);

            // 6. Simpan ke tabel Detail (transaction_details)
            foreach ($details as $detail) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'subtotal' => $detail['subtotal'],
                    // 👇 TAMBAHKAN INI: Rekam harga modal ke riwayat transaksi
                    'cost_price' => $detail['cost_price'],
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

    // 🔥 FITUR BARU: VOID TRANSAKSI
    public function destroy($id)
    {
        $transaction = Transaction::with('details')->findOrFail($id);

        // 1. Kembalikan Stok Produk
        foreach ($transaction->details as $detail) {
            $product = Product::find($detail->product_id);
            if ($product) {
                $oldStock = $product->stock;
                $newStock = $oldStock + $detail->quantity; // Tambah balik stoknya

                $product->update(['stock' => $newStock]);

                // 2. Catat ke Log Riwayat Stok
                StockLog::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(), // Kasir/Admin yang nge-void
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'changed_amount' => $detail->quantity,
                    'type' => 'void_transaction' // Keterangan log
                ]);
            }
        }

        // 3. Hapus Detail Struk dan Transaksi Utamanya
        $transaction->details()->delete();
        $transaction->delete();

        return response()->json(['message' => 'Transaksi berhasil di-void. Stok telah dikembalikan!'], 200);
    }
}
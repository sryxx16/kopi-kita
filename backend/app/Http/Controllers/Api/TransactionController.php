<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'payment_method' => 'required|string',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $totalPrice = $request->total_price;
            $details = [];

            // 2. Simpan detail items & kurangi stok
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];

                $details[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                    // Tarik harga modal dari database master produk
                    'cost_price' => $product->cost_price ?? 0,
                ];

                // Kurangi stok saat checkout
                $product->decrement('stock', $item['quantity']);
            }

            // 3. Cek Uang
            if ($request->amount_paid < $totalPrice) {
                // Return 400 Bad Request biar gak crash
                return response()->json(['message' => 'Uang pembayaran kurang!'], 400);
            }

            $change = $request->amount_paid - $totalPrice;

            // 4. Simpan ke tabel Induk (transactions)
            // PASTIKAN NAMA KOLOM SAMA PERSIS DENGAN DATABASE
            $transaction = Transaction::create([
                'user_id' => auth()->id() ?? 1,
                'invoice_number' => 'INV-' . strtoupper(uniqid()), // Sesuai migration
                'total_price' => $totalPrice,
                'amount_paid' => $request->amount_paid,
                'change' => $change, // Sesuai migration
                'payment_method' => $request->payment_method,
                'discount_amount' => $request->discount_amount ?? 0,
            ]);

            // 5. Simpan ke tabel Detail (transaction_details)
            foreach ($details as $detail) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'subtotal' => $detail['subtotal'],
                    'cost_price' => $detail['cost_price'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Transaksi Berhasil!',
                'invoice' => $transaction->invoice_number, // Kembalikan ke React
                'kembalian' => $change
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // INI PENTING: Biar error detailnya muncul di browser kalau masih gagal!
            return response()->json([
                'message' => 'Gagal memproses transaksi',
                'error_detail' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $transaction = Transaction::with('details')->findOrFail($id);

        foreach ($transaction->details as $detail) {
            $product = Product::find($detail->product_id);
            if ($product) {
                $oldStock = $product->stock;
                $newStock = $oldStock + $detail->quantity;

                $product->update(['stock' => $newStock]);

                StockLog::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id() ?? 1,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'changed_amount' => $detail->quantity,
                    'type' => 'void_transaction'
                ]);
            }
        }

        $transaction->details()->delete();
        $transaction->delete();

        return response()->json(['message' => 'Transaksi berhasil di-void. Stok telah dikembalikan!'], 200);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\StockLog;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->get();
        // Tambahkan URL lengkap untuk gambar agar React gampang ngebacanya
        $products->transform(function ($product) {
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            return $product;
        });
        return response()->json(['data' => $products], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048' // Maksimal 2MB
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'image' => $imagePath,
            'status' => 'tersedia'
        ]);

        return response()->json(['message' => 'Menu berhasil ditambahkan!', 'data' => $product], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $product = Product::findOrFail($id);
        $imagePath = $product->image;

        // Kalau admin upload gambar baru
        if ($request->hasFile('image')) {
            // Hapus gambar lama kalau ada
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            // Simpan gambar baru
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'name' => $request->name,
            'price' => $request->price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'image' => $imagePath,
        ]);

        return response()->json(['message' => 'Menu berhasil diupdate!'], 200);
    }

    // FITUR BARU: HAPUS MENU
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Hapus file gambarnya juga dari folder storage
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Menu berhasil dihapus permanen!'], 200);
    }

    // FITUR BARU: TOGGLE STATUS (Aktif / Non-Aktif)
    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);

        // Balikkan statusnya
        $product->status = $product->status === 'tersedia' ? 'habis' : 'tersedia';
        $product->save();

        return response()->json([
            'message' => 'Status menu berhasil diubah!',
            'status' => $product->status
        ], 200);
    }

    public function bulkUpdateStock(Request $request)
    {
        $request->validate([
            'stocks' => 'required|array',
            'stocks.*.id' => 'required|exists:products,id',
            'stocks.*.stock' => 'required|integer|min:0'
        ]);

        foreach ($request->stocks as $item) {
            $product = Product::find($item['id']);
            $oldStock = $product->stock;
            $newStock = $item['stock'];

            // Kalau stoknya beda/berubah, baru kita update dan catat ke Log
            if ($oldStock != $newStock) {
                $product->update(['stock' => $newStock]);

                StockLog::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(), // Ngambil ID admin yang lagi login
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'changed_amount' => $newStock - $oldStock,
                    'type' => 'bulk_update'
                ]);
            }
        }

        return response()->json(['message' => 'Stok massal berhasil diupdate!'], 200);
    }

    // FUNGSI BARU 2: Ngambil Data Riwayat Stok
    public function stockLogs()
    {
        // Ambil riwayat terbaru, urutkan dari yang paling baru
        $logs = StockLog::with(['product', 'user'])->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $logs], 200);
    }
}

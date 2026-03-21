<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Fungsi ngambil data (Yang udah kita buat kemarin)
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json(['data' => $products], 200);
    }

    // FUNGSI BARU: Untuk nambah menu ke database
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'status' => 'tersedia' // Default selalu tersedia saat baru ditambah
        ]);

        return response()->json([
            'message' => 'Menu baru berhasil ditambahkan!',
            'data' => $product
        ], 201);
    }
}

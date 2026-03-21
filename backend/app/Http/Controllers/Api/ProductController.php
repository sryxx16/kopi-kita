<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Fungsi untuk mengambil semua menu
    public function index()
    {
        // Ambil semua produk sekalian tarik data nama kategorinya
        $products = Product::with('category')->get();

        return response()->json([
            'message' => 'Berhasil mengambil data produk',
            'data' => $products
        ], 200);
    }
}

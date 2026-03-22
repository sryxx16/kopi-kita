<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Ambil semua kategori
    public function index()
    {
        $categories = Category::all();
        return response()->json(['data' => $categories], 200);
    }

    // Tambah kategori baru
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $category = Category::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan!',
            'data' => $category
        ], 201);
    }
}

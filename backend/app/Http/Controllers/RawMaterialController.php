<?php

namespace App\Http\Controllers; // Sesuaikan kalau abang pindahin ke folder Api

use App\Models\RawMaterial;
use Illuminate\Http\Request;

class RawMaterialController extends Controller
{
    public function index() {
        return response()->json(RawMaterial::orderBy('name', 'asc')->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'stock' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'low_stock_threshold' => 'required|numeric|min:0',
        ]);
        $material = RawMaterial::create($request->all());
        return response()->json(['message' => 'Bahan baku ditambahkan!', 'data' => $material], 201);
    }

    public function update(Request $request, $id) {
        $material = RawMaterial::findOrFail($id);
        $material->update($request->all());
        return response()->json(['message' => 'Bahan baku diupdate!'], 200);
    }

    public function destroy($id) {
        RawMaterial::findOrFail($id)->delete();
        return response()->json(['message' => 'Bahan baku dihapus!'], 200);
    }
}

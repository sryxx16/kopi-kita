<?php

namespace App\Http\Controllers;

use App\Models\RawMaterial;
use App\Models\Expense; // Panggil model Expense buat nyatet duit keluar
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RawMaterialController extends Controller
{
    public function index() {
        return response()->json(RawMaterial::orderBy('name', 'asc')->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|unique:raw_materials,name',
            'stock' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'low_stock_threshold' => 'required|numeric|min:0',
            // 👇 Tambahan buat nangkep input keuangan
            'record_expense' => 'boolean',
            'cost' => 'nullable|numeric|min:0'
        ], [
            'name.unique' => 'Nama bahan baku ini sudah terdaftar di sistem!'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // 1. Simpan bahan baku baru
            $material = RawMaterial::create($request->only(['name', 'stock', 'unit', 'low_stock_threshold']));

            // 2. Kalau checkbox "Catat Keuangan" dicentang, masukkan ke tabel Expense
            if ($request->record_expense && $request->cost > 0) {
                \App\Models\Expense::create([
                    'expense_date' => now()->toDateString(),
                    'category' => 'Bahan Baku',
                    'description' => "Beli bahan baku baru: {$request->stock} {$material->unit} {$material->name}",
                    'amount' => $request->cost,
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Bahan baku ditambahkan!', 'data' => $material], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan bahan baku', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id) {
        $request->validate([
            // 🔥 Boleh sama dengan namanya sendiri (kalo cuma ngedit stok), tapi nggak boleh sama dengan barang lain
            'name' => 'required|string|unique:raw_materials,name,' . $id,
            'stock' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'low_stock_threshold' => 'required|numeric|min:0',
        ], [
            'name.unique' => 'Nama bahan baku ini sudah dipakai oleh barang lain!'
        ]);

        $material = RawMaterial::findOrFail($id);
        $material->update($request->all());
        return response()->json(['message' => 'Bahan baku diupdate!'], 200);
    }

    public function destroy($id) {
        RawMaterial::findOrFail($id)->delete();
        return response()->json(['message' => 'Bahan baku dihapus!'], 200);
    }

    // 🔥 FITUR BARU: RESTOCK PINTAR 🔥
    public function restock(Request $request, $id) {
        $request->validate([
            'added_stock' => 'required|numeric|min:0.01',
            'cost' => 'required|numeric|min:0',
            'record_expense' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            // 1. Tambah stok bahan baku
            $material = RawMaterial::findOrFail($id);
            $material->stock += $request->added_stock;
            $material->save();

            // 2. Catat ke pengeluaran jika checkbox dicentang
            if ($request->record_expense && $request->cost > 0) {
                Expense::create([
                    'expense_date' => now()->toDateString(),
                    'category' => 'Bahan Baku',
                    'description' => "Restock {$request->added_stock} {$material->unit} {$material->name}",
                    'amount' => $request->cost,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Restock berhasil disimpan!'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal melakukan restock', 'error' => $e->getMessage()], 500);
        }
    }
}

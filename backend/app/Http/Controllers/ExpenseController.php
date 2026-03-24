<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    // Tampilkan semua pengeluaran
    public function index()
    {
        $expenses = Expense::orderBy('expense_date', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($expenses, 200);
    }

    // Catat pengeluaran baru
    public function store(Request $request)
    {
        $request->validate([
            'expense_date' => 'required|date',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $expense = Expense::create($request->all());

        return response()->json([
            'message' => 'Pengeluaran berhasil dicatat!',
            'data' => $expense
        ], 201);
    }

    // Hapus catatan pengeluaran (kalau kasir salah input)
    public function destroy($id)
    {
        Expense::findOrFail($id)->delete();
        return response()->json(['message' => 'Catatan pengeluaran dihapus.'], 200);
    }
}

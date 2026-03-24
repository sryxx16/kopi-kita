<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $filter = $request->query('filter', 'today');
        $customDate = $request->query('date');

        // 1. Tentukan Periode Saat Ini
        $startDate = Carbon::today();
        $endDate = Carbon::now();

        // 2. Tentukan Periode Sebelumnya (Untuk Perbandingan)
        $prevStartDate = Carbon::yesterday()->startOfDay();
        $prevEndDate = Carbon::yesterday()->endOfDay();

        if ($filter === 'custom' && $customDate) {
            $startDate = Carbon::parse($customDate)->startOfDay();
            $endDate = Carbon::parse($customDate)->endOfDay();
            $prevStartDate = Carbon::parse($customDate)->subDay()->startOfDay();
            $prevEndDate = Carbon::parse($customDate)->subDay()->endOfDay();
        } else if ($filter === '7days') {
            $startDate = Carbon::today()->subDays(6)->startOfDay();
            $prevStartDate = Carbon::today()->subDays(13)->startOfDay();
            $prevEndDate = Carbon::today()->subDays(7)->endOfDay();
        } else if ($filter === 'month') {
            $startDate = Carbon::today()->startOfMonth()->startOfDay();
            $prevStartDate = Carbon::today()->subMonth()->startOfMonth()->startOfDay();
            $prevEndDate = Carbon::today()->subMonth()->endOfMonth()->endOfDay();
        }

        // Ambil Data Saat Ini
        $transactions = Transaction::with('details.product')->whereBetween('created_at', [$startDate, $endDate])->orderBy('created_at', 'desc')->get();
        $totalRevenue = $transactions->sum('total_price');
        $totalTransactions = $transactions->count();

        // 🔥 PERBAIKAN: Hitung Total Modal (Super Aman dari data lama / null)
        $totalCost = 0;
        foreach ($transactions as $tx) {
            if ($tx->details) {
                foreach ($tx->details as $detail) {
                    // Pakai (float) dan ?? 0 biar kalau data lama kosong, gak bikin server crash
                    $hargaModal = (float) ($detail->cost_price ?? 0);
                    $qty = (int) ($detail->quantity ?? 0);
                    $totalCost += ($hargaModal * $qty);
                }
            }
        }
        $grossProfit = $totalRevenue - $totalCost; // Omzet - Modal = Cuan!

        // 👇 TAMBAHKAN KODE INI: Hitung Pengeluaran Operasional (Expenses)
        $expenses = \App\Models\Expense::whereBetween('expense_date', [
            $startDate->toDateString(),
            $endDate->toDateString()
        ])->get();

        $totalExpense = $expenses->sum('amount'); // Total Kas Keluar

        // LABA BERSIH SEJATI! (Laba Kotor dikurangi Kas Keluar)
        $netProfit = $grossProfit - $totalExpense;

        // Ambil Data Periode Sebelumnya
        $prevTransactions = Transaction::whereBetween('created_at', [$prevStartDate, $prevEndDate])->get();
        $prevRevenue = $prevTransactions->sum('total_price');
        $prevTransactionsCount = $prevTransactions->count();

        // Hitung Persentase Kenaikan/Penurunan
        $revenueChange = $prevRevenue > 0 ? (($totalRevenue - $prevRevenue) / $prevRevenue) * 100 : ($totalRevenue > 0 ? 100 : 0);
        $countChange = $prevTransactionsCount > 0 ? (($totalTransactions - $prevTransactionsCount) / $prevTransactionsCount) * 100 : ($totalTransactions > 0 ? 100 : 0);


        $cashRevenue = $transactions->where('payment_method', 'cash')->sum('total_price');
        $qrisRevenue = $transactions->where('payment_method', 'qris')->sum('total_price');
        $transferRevenue = $transactions->where('payment_method', 'transfer')->sum('total_price');
        // Analisis Jam
        $hourlyAnalysis = Transaction::select(DB::raw('HOUR(CONVERT_TZ(created_at, "+00:00", "+07:00")) as hour'), DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])->groupBy('hour')->orderBy('hour')->get();
        $totalDiscount = $transactions->sum('discount_amount');
        return response()->json([
            'summary' => [
                'revenue' => $totalRevenue,
                // ...
                'total_discount' => $totalDiscount, // 👇 KIRIM KE REACT
                'payment_breakdown' => [
                   // ...
                ]
            ],]);
        return response()->json([
            'summary' => [
                'revenue' => $totalRevenue,
                'revenue_change' => round($revenueChange, 1),
                'gross_profit' => $grossProfit,
                'total_expense' => $totalExpense ?? 0,
                'net_profit' => $netProfit ?? 0,
                'transactions_count' => $totalTransactions,
                'transactions_count_change' => round($countChange, 1),

                // 👇 TAMBAHIN DATA INI DI DALAM SUMMARY BIAR DIKIRIM KE REACT
                'payment_breakdown' => [
                    'cash' => $cashRevenue,
                    'qris' => $qrisRevenue,
                    'transfer' => $transferRevenue
                ]
            ],
            'transactions' => $transactions,
            'hourly_analysis' => $hourlyAnalysis
        ], 200);


    }



    public function exportExcel(Request $request)
    {
        $filter = $request->query('filter', 'today');
        $customDate = $request->query('date');

        $startDate = Carbon::today();
        $endDate = Carbon::now();

        if ($filter === 'custom' && $customDate) {
            $startDate = Carbon::parse($customDate)->startOfDay();
            $endDate = Carbon::parse($customDate)->endOfDay();
        } else if ($filter === '7days') {
            $startDate = Carbon::today()->subDays(6)->startOfDay();
        } else if ($filter === 'month') {
            $startDate = Carbon::today()->startOfMonth()->startOfDay();
        }

        return Excel::download(new TransactionsExport($startDate, $endDate), 'laporan-kopi-kita.xlsx');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Exports\TransactionsExport; // Tambah di atas
use Maatwebsite\Excel\Facades\Excel; // Tambah di atas

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

        // Ambil Data Periode Sebelumnya
        $prevTransactions = Transaction::whereBetween('created_at', [$prevStartDate, $prevEndDate])->get();
        $prevRevenue = $prevTransactions->sum('total_price');
        $prevTransactionsCount = $prevTransactions->count();

        // Hitung Persentase Kenaikan/Penurunan
        $revenueChange = $prevRevenue > 0 ? (($totalRevenue - $prevRevenue) / $prevRevenue) * 100 : ($totalRevenue > 0 ? 100 : 0);
        $countChange = $prevTransactionsCount > 0 ? (($totalTransactions - $prevTransactionsCount) / $prevTransactionsCount) * 100 : ($totalTransactions > 0 ? 100 : 0);

        // Analisis Jam
        $hourlyAnalysis = Transaction::select(DB::raw('HOUR(CONVERT_TZ(created_at, "+00:00", "+07:00")) as hour'), DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])->groupBy('hour')->orderBy('hour')->get();

        return response()->json([
            'summary' => [
                'revenue' => $totalRevenue,
                'revenue_change' => round($revenueChange, 1), // Persentase Omzet
                'transactions_count' => $totalTransactions,
                'transactions_count_change' => round($countChange, 1), // Persentase Jumlah Transaksi
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

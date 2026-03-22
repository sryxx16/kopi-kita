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

        // Ambil Transaksi
        $transactions = Transaction::with('details.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        // 🔥 LOGIKA BARU: Analisis Jam Teramai
        // Mengelompokkan jumlah transaksi berdasarkan jam (0-23)
        $hourlyAnalysis = Transaction::select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $totalRevenue = $transactions->sum('total_price');
        $totalTransactions = $transactions->count();

        return response()->json([
            'message' => 'Data Laporan Berhasil Diambil',
            'summary' => [
                'revenue' => $totalRevenue,
                'transactions_count' => $totalTransactions,
            ],
            'transactions' => $transactions,
            'hourly_analysis' => $hourlyAnalysis // Kirim data jam teramai
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

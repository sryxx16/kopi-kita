<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardStats()
    {
        // 1. Ambil tanggal hari ini
        $today = Carbon::today();

        // 2. Hitung Pendapatan Hari Ini
        $incomeToday = Transaction::whereDate('created_at', $today)->sum('total_price');

        // 3. Hitung Jumlah Transaksi Hari Ini
        $transactionsToday = Transaction::whereDate('created_at', $today)->count();

        // 4. Total Pendapatan Keseluruhan (All Time)
        $totalIncome = Transaction::sum('total_price');

        // 5. Ambil 10 Riwayat Transaksi Terakhir (beserta nama kasirnya)
        $recentTransactions = Transaction::with('user:id,name')
                                ->orderBy('created_at', 'desc')
                                ->take(10)
                                ->get();

        return response()->json([
            'message' => 'Berhasil mengambil data laporan',
            'stats' => [
                'income_today' => $incomeToday,
                'transactions_today' => $transactionsToday,
                'total_income' => $totalIncome
            ],
            'recent_transactions' => $recentTransactions
        ], 200);
    }
}

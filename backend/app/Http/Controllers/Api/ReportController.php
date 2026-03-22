<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $filter = $request->query('filter', 'today');
        $customDate = $request->query('date'); // Tangkap tanggal dari kalender React

        // Default: Hari ini
        $startDate = Carbon::today();
        $endDate = Carbon::now();

        // LOGIKA FILTER TANGGAL
        if ($filter === 'custom' && $customDate) {
            // Kalau admin milih tanggal di kalender
            $startDate = Carbon::parse($customDate)->startOfDay();
            $endDate = Carbon::parse($customDate)->endOfDay();
        } else if ($filter === '7days') {
            $startDate = Carbon::today()->subDays(6);
        } else if ($filter === 'month') {
            $startDate = Carbon::today()->startOfMonth();
        }

        $transactions = Transaction::with('details.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalRevenue = $transactions->sum('total_price');
        $totalTransactions = $transactions->count();

        return response()->json([
            'message' => 'Data Laporan Berhasil Diambil',
            'summary' => [
                'revenue' => $totalRevenue,
                'transactions_count' => $totalTransactions,
            ],
            'transactions' => $transactions
        ], 200);
    }
}

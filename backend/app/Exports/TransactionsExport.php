<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Transaction::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Header Excel
    public function headings(): array
    {
        return [
            'ID',
            'No. Invoice',
            'Total Harga',
            'Uang Bayar',
            'Waktu Transaksi'
        ];
    }

    // Map data ke kolom
    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->invoice ?? 'INV-'.$transaction->id,
            'Rp ' . number_format($transaction->total_price, 0, ',', '.'),
            'Rp ' . number_format($transaction->pay_amount, 0, ',', '.'),
            $transaction->created_at->format('d-m-Y H:i')
        ];
    }
}

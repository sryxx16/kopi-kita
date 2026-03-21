<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Satu transaksi punya banyak detail barang
    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    // Transaksi ini dilayani oleh satu kasir (user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
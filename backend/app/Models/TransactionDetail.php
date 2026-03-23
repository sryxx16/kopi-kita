<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Detail ini milik satu produk tertentu
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id')->withTrashed();
    }


}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Ini artinya semua kolom boleh diisi (mass-assignment)
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

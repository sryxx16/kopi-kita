<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;


    // Ini artinya semua kolom boleh diisi (mass-assignment)
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

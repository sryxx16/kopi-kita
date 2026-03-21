<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Bikin Kategori Dulu
        $kopi = Category::create(['name' => 'Kopi']);
        $nonKopi = Category::create(['name' => 'Non-Kopi']);
        $snack = Category::create(['name' => 'Snack']);

        // 2. Bikin Produknya
        Product::create([
            'category_id' => $kopi->id,
            'name' => 'Kopi Susu Gula Aren',
            'price' => 18000,
            'status' => 'tersedia'
        ]);

        Product::create([
            'category_id' => $kopi->id,
            'name' => 'Americano',
            'price' => 15000,
            'status' => 'tersedia'
        ]);

        Product::create([
            'category_id' => $nonKopi->id,
            'name' => 'Matcha Latte',
            'price' => 20000,
            'status' => 'tersedia'
        ]);

        Product::create([
            'category_id' => $snack->id,
            'name' => 'Kentang Goreng',
            'price' => 12000,
            'status' => 'tersedia'
        ]);
    }
}
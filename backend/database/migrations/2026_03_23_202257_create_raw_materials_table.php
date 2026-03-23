<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('raw_materials', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Nama bahan (Biji Kopi Arabika)
        $table->decimal('stock', 10, 2)->default(0); // Stok (bisa desimal)
        $table->string('unit'); // Satuan (Gram, Liter, Pcs)
        $table->decimal('low_stock_threshold', 10, 2)->default(10); // Batas peringatan mau habis
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raw_materials');
    }
};
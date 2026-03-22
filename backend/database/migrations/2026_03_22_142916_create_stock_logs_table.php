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
    Schema::create('stock_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Siapa yang ngubah (Admin/Kasir)
        $table->integer('old_stock'); // Stok lama
        $table->integer('new_stock'); // Stok baru
        $table->integer('changed_amount'); // Selisihnya (+ atau -)
        $table->string('type'); // Jenis perubahan: 'manual_edit', 'bulk_update', 'penjualan'
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
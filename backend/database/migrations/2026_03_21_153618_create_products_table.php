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
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->foreignId('category_id')->constrained()->onDelete('cascade'); // Relasi ke tabel categories
        $table->string('name');
        $table->decimal('price', 10, 2); // Menggunakan decimal untuk harga yang akurat
        $table->string('image')->nullable(); // Foto produk (bisa kosong)
        $table->enum('status', ['tersedia', 'habis'])->default('tersedia');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
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
    Schema::create('promos', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Nama promo (Diskon Akhir Pekan)
        $table->string('code')->unique(); // Kode voucher (WEEKEND20)
        $table->enum('discount_type', ['percentage', 'fixed']); // Persen atau Nominal Rupiah
        $table->decimal('discount_value', 10, 2); // Nilai diskonnya (20 atau 15000)
        $table->boolean('is_active')->default(true); // Status aktif/nggak
        $table->date('valid_until')->nullable(); // Berlaku sampai kapan
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
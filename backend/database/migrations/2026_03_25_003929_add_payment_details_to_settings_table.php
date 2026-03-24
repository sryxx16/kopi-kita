<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up() {
    Schema::table('settings', function (Blueprint $table) {
        $table->string('qris_image')->nullable(); // Simpan path gambar QRIS
        $table->string('bank_name')->nullable();  // Contoh: BCA
        $table->string('bank_account_number')->nullable(); // Contoh: 12345678
        $table->string('bank_account_name')->nullable();   // Contoh: Kopi Kita
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            //
        });
    }
};
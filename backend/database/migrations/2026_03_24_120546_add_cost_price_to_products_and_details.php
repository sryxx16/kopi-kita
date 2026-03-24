<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
    {
        // Tambah Harga Modal di Master Produk
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('cost_price', 15, 2)->default(0)->after('price');
        });

        // Tambah Harga Modal di Histori Transaksi (Biar laba masa lalu gak berubah kalau modal naik)
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->decimal('cost_price', 15, 2)->default(0)->after('subtotal');
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('cost_price');
        });
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropColumn('cost_price');
        });
    }
};

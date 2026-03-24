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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('expense_date'); // Tanggal kas keluar
            $table->string('category'); // Kategori: Operasional, Bahan Baku, Gaji, dll
            $table->string('description'); // Keterangan: Beli Es Batu, Bayar Listrik
            $table->decimal('amount', 15, 2); // Nominal uang keluar
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('expenses');
    }
};
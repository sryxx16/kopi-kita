<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;

// Route untuk Login (Bisa diakses tanpa token)
Route::post('/login', [AuthController::class, 'login']);

// Route yang dilindungi (Harus bawa token dari login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
//api produk
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']); // <--- Jalur baru buat nambah menu!

//api transaksi
Route::post('/transactions', [TransactionController::class, 'store']);
Route::get('/reports/dashboard', [ReportController::class, 'dashboardStats']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
//api karyawan
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
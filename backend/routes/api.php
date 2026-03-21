<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;

// Route untuk Login (Bisa diakses tanpa token)
Route::post('/login', [AuthController::class, 'login']);

// Route yang dilindungi (Harus bawa token dari login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

Route::get('/products', [ProductController::class, 'index']);
Route::post('/transactions', [TransactionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/reports/dashboard', [ReportController::class, 'dashboardStats']);
});
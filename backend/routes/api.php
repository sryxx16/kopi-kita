<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\RawMaterialController;
use App\Http\Controllers\PromoController;
use App\Http\Controllers\SettingController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Must be logged in)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);

    // Products (CRUD & Status)
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/bulk-stock', [ProductController::class, 'bulkUpdateStock']);
    Route::post('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/status', [ProductController::class, 'toggleStatus']);

    // Transactions & Reports
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/reports/dashboard', [ReportController::class, 'dashboardStats']);

    // Employee Management (Users)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Logout (Opsional, tapi disarankan ada)
    Route::post('/logout', [AuthController::class, 'logout']);

    // RUTE BARU: Bulk Update & Riwayat Stok
    Route::post('/products/bulk-stock', [ProductController::class, 'bulkUpdateStock']);
    Route::get('/stock-logs', [ProductController::class, 'stockLogs']);

    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel']);

    //api inventaris
    Route::apiResource('inventory', RawMaterialController::class);

    //api promo
    Route::apiResource('promos', PromoController::class);

    // Rute Pengaturan
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
});

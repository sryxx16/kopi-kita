<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/qris/{filename}', function ($filename) {
    $path = 'qris/' . $filename;

    // Cek apakah file-nya ada di dalam brankas Storage 'public'
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }

    // Ambil file dan paksa tampilkan sebagai gambar
    $file = Storage::disk('public')->get($path);
    $type = Storage::disk('public')->mimeType($path);

    return Response::make($file, 200)->header("Content-Type", $type);
});

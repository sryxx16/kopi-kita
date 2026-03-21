<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 1. Fungsi untuk ngambil daftar kasir
    public function index()
    {
        // Kita cuma ambil user yang rolenya 'kasir' biar admin gak ikut ke-list
        $users = User::where('role', 'kasir')->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $users], 200);
    }

    // 2. Fungsi untuk nambah kasir baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email', // Email gak boleh dobel
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Wajib di-hash biar bisa buat login!
            'role' => 'kasir', // Otomatis jadi kasir
        ]);

        return response()->json([
            'message' => 'Akun Kasir berhasil dibuat!',
            'data' => $user
        ], 201);
    }
}

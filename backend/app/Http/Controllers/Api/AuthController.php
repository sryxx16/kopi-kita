<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi inputan dari frontend
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 2. Cek apakah email dan password cocok di database
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Kita pakai pesan umum "Kredensial salah" demi keamanan (mencegah brute-force)
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        // 3. Jika cocok, ambil data usernya
        $user = User::where('email', $request->email)->firstOrFail();

        // 4. Buatkan token Sanctum
        $token = $user->createToken('kopi_kita_token')->plainTextToken;

        // 5. Kirim data user dan token ke frontend
        return response()->json([
            'message' => 'Login Berhasil',
            'user' => $user,
            'token' => $token
        ], 200);
    }
}

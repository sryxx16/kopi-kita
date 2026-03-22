<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 1. Ambil Data Karyawan
    public function index()
    {
        // Urutkan dari yang terbaru
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $users], 200);
    }

    // 2. Tambah Karyawan Baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,kasir' // <-- Wajib pilih Admin atau Kasir
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Sandi dienkripsi
            'role' => $request->role,
        ]);

        return response()->json(['message' => 'Karyawan berhasil ditambahkan!', 'data' => $user], 201);
    }

    // 3. Edit Karyawan & Reset Password
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            // Cek email unique, TAPI kecualikan email si user ini sendiri
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:admin,kasir',
            'password' => 'nullable|string|min:6' // Password boleh kosong kalau ngga mau diganti
        ]);

        $dataToUpdate = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        // Jika admin ngisi kolom password, berarti minta ganti password
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $user->update($dataToUpdate);

        return response()->json(['message' => 'Data Karyawan berhasil diupdate!'], 200);
    }

    // 4. Hapus Karyawan
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // KEAMANAN: Jangan biarkan Admin menghapus dirinya sendiri saat sedang login!
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun Anda sendiri!'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Akun Karyawan berhasil dihapus permanen!'], 200);
    }
}

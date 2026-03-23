<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Ambil data pengaturan (selalu ambil baris pertama/ID 1)
    public function index() {
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Kopi Kita',
                'store_address' => 'Jl. Ngoding Bersama No. 99, Jakarta',
                'store_phone' => '081234567890',
                'tax_percentage' => 0
            ]
        );
        return response()->json($setting, 200);
    }

    // Simpan perubahan pengaturan
    public function update(Request $request) {
        $request->validate([
            'store_name' => 'required|string',
            'store_address' => 'nullable|string',
            'store_phone' => 'nullable|string',
            'tax_percentage' => 'required|integer|min:0|max:100',
        ]);

        $setting = Setting::find(1);
        $setting->update($request->all());

        return response()->json(['message' => 'Pengaturan Toko berhasil diperbarui!'], 200);
    }
}

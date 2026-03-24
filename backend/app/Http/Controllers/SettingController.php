<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Ambil data pengaturan (selalu ambil baris paling atas tanpa peduli ID-nya)
    public function index() {
        $setting = Setting::first();

        // Kalau belum ada data sama sekali, bikin baru
        if (!$setting) {
            $setting = Setting::create([
                'store_name' => 'KOPI KITA',
                'store_address' => 'Jl. Ngoding Bersama No. 99, Jakarta',
                'store_phone' => '081234567890',
                'tax_percentage' => 0
            ]);
        }

        return response()->json($setting, 200);
    }

    // Simpan perubahan pengaturan
    public function update(Request $request) {
        $request->validate([
            'store_name' => 'required|string',
            'store_address' => 'nullable|string',
            'store_phone' => 'nullable|string',
            'tax_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $setting = Setting::first();

        if (!$setting) {
            // Jaga-jaga kalau kosong banget
            Setting::create($request->all());
        } else {
            // Update baris pertama yang ketemu
            $setting->update($request->all());
        }

        return response()->json(['message' => 'Pengaturan Toko berhasil diperbarui!'], 200);
    }
}

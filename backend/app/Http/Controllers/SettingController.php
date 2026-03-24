<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index() {
        $setting = Setting::first();

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

    public function update(Request $request) {
        $request->validate([
            'store_name' => 'required|string',
            'store_address' => 'nullable|string',
            'store_phone' => 'nullable|string',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_name' => 'nullable|string',
            'qris_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Validasi file gambar maksimal 2MB
        ]);

        $setting = Setting::first();
        $data = $request->except('qris_image');

        // Proses Upload Foto QRIS
        if ($request->hasFile('qris_image')) {
            // Hapus gambar lama kalau ada biar server nggak penuh
            if ($setting && $setting->qris_image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $setting->qris_image));
            }
            // Simpan gambar baru
            $path = $request->file('qris_image')->store('qris', 'public');
            $data['qris_image'] = '/storage/' . $path;
        }

        if (!$setting) {
            Setting::create($data);
        } else {
            $setting->update($data);
        }

        return response()->json(['message' => 'Pengaturan Toko berhasil diperbarui!'], 200);
    }
}

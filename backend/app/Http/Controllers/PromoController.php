<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index() {
        return response()->json(Promo::orderBy('created_at', 'desc')->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:promos',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
        ]);

        // Paksa kode jadi HURUF BESAR SEMUA biar seragam
        $data = $request->all();
        $data['code'] = strtoupper($data['code']);

        $promo = Promo::create($data);
        return response()->json(['message' => 'Promo berhasil ditambahkan!', 'data' => $promo], 201);
    }

    public function update(Request $request, $id) {
        $promo = Promo::findOrFail($id);
        $request->validate([
            'code' => 'required|string|unique:promos,code,'.$promo->id,
        ]);

        $data = $request->all();
        if(isset($data['code'])) $data['code'] = strtoupper($data['code']);

        $promo->update($data);
        return response()->json(['message' => 'Promo diupdate!'], 200);
    }

    public function destroy($id) {
        Promo::findOrFail($id)->delete();
        return response()->json(['message' => 'Promo dihapus!'], 200);
    }
}

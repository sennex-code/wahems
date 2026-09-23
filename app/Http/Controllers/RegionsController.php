<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Facility;
use App\Models\Municipality;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionsController extends Controller
{
    public function getRegions()
    {
        $regions = Region::get();
        return response()->json([
            'regions' => $regions
        ]);
    }

    public function getProvinces($psgcCode)
    {
        $psgc_two_digits = substr($psgcCode, 0, 2);
        $provinces = Province::where('psgc_10_digit_code', 'like', $psgc_two_digits . '%')->get();
        return response()->json([
            'provinces' => $provinces
        ]);
    }

    public function getMunicipalities($psgcCode)
    {
        $province = Province::where('psgc_10_digit_code', $psgcCode)->first();
        if (!$province) return response()->json(['municipalities' => []]);

        $municipalities = Municipality::where('province_id', $province->id)->get();

        return response()->json(['municipalities' => $municipalities]);
    }

    public function getBarangays($psgcCode)
    {
        $municipality = Municipality::where('psgc_10_digit_code', $psgcCode)->first();
        if (!$municipality) return response()->json(['barangays' => []]);

        $barangays = Barangay::where('municipality_id', $municipality->id)->get();
        return response()->json(['barangays' => $barangays]);
    }

    public function getFacilities($psgcCode)
    {
        $facilities = Facility::where('municipality_code', $psgcCode)->get();

        return response()->json([
            'facilities' => $facilities
        ]);
    }
}
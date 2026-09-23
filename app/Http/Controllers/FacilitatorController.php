<?php

namespace App\Http\Controllers;

use App\Models\Facilitator;
use Illuminate\Http\Request;

class FacilitatorController extends Controller
{
    public function index()
    {
        $facilitators = Facilitator::all();
        
        return response()->json([
            'facilitators' => $facilitators
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $facilitator = Facilitator::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Facilitator created successfully',
            'facilitator' => $facilitator
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $facilitator = Facilitator::findOrFail($id);
        $facilitator->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Facilitator updated successfully',
            'facilitator' => $facilitator
        ]);
    }

    public function destroy($id)
    {
        $facilitator = Facilitator::findOrFail($id);
        $facilitator->delete();

        return response()->json([
            'message' => 'Facilitator deleted successfully'
        ]);
    }

}
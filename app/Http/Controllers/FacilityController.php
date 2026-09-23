<?php

namespace App\Http\Controllers;

use App\Models\Cluster;
use App\Models\Event;
use App\Models\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Pest\Collision\Events;

class FacilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
     $facilities = Facility::with([
        'region',
        'province',
        'municipality',
        'barangay'
    ])
    ->where('code', 'LIKE', 'WAH%')
    ->orderBy('facility_name', 'asc')
    ->paginate(10);

    return Inertia::render(
            "Facility",
         [
            "facilities" => $facilities
         ]
    );  
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    
        $request->validate([
            'facility_name' => 'required|string',
            'wah_code' => 'required|string',
            'short_code' => 'required|string',
            'region_code' => 'required|string',
            'province_code' => 'required|string',
            'municipality_code' => 'required|string',
            'barangay_code' => 'required|string',
        ]);

        $theSameCodeExists = Facility::where('code', $request->wah_code)->exists();
        $theSamgeShortCodeExists = Facility::where('short_code', $request->short_code)->exists();
        if ($theSameCodeExists) {
            throw ValidationException::withMessages([
                'wah_code' => 'The WAH code already exists.'
            ]);
        }
        if ($theSamgeShortCodeExists) {
            throw ValidationException::withMessages([
                'short_code' => 'The short code already exists.'
            ]);
        }

        Facility::create([
            'facility_name' => $request->facility_name,
            'code' => $request->wah_code,
            'short_code' => $request->short_code,
            'region_code' => $request->region_code,
            'province_code' => $request->province_code,
            'municipality_code' => $request->municipality_code,
            'barangay_code' => $request->barangay_code,
        ]);

        return redirect()->route('facilities.index')->with('success', 'Facility created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Facility $facility)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Facility $facility)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $validated = $request->validate([
        'facility_name'     => 'required|string|max:255',
        'wah_code'          => 'required|string',
        'short_code'        => 'required|string',
        'region_code'       => 'required',
        'province_code'     => 'required',
        'municipality_code' => 'required',
        'barangay_code'     => 'required',
    ]);

    $facility = Facility::findOrFail($id);

    // Check for any connection with Event, block ALL updates if so
    $isReferenced = \App\Models\Event::where('facility_code', $facility->code)->exists();
    if ($isReferenced) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'facility_name' => 'Cannot update facility. This facility is referenced by one or more events.'
        ]);
    }

    // Uniqueness checks
    $theSameCodeExists = Facility::where('code', $validated['wah_code'])
        ->where('id', '!=', $id)
        ->exists();
    $theSameShortCodeExists = Facility::where('short_code', $validated['short_code'])
        ->where('id', '!=', $id)
        ->exists();
    if ($theSameCodeExists) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'wah_code' => 'The WAH code already exists.'
        ]);
    }
    if ($theSameShortCodeExists) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'short_code' => 'The short code already exists.'
        ]);
    }

    $facility->update([
        'facility_name'     => $validated['facility_name'],
        'code'              => $validated['wah_code'],
        'short_code'        => $validated['short_code'],
        'region_code'       => $validated['region_code'],
        'province_code'     => $validated['province_code'],
        'municipality_code' => $validated['municipality_code'],
        'barangay_code'     => $validated['barangay_code'],
    ]);

    return redirect()->back()->with('success', 'Facility updated successfully');
}
    /**
     * Remove the specified resource from storage.
     */


public function destroy(Facility $facility)
{
    $isInEvent = Event::where('facility_code', $facility->code)->exists();
    $isInClusters = $facility->clusters()->exists();

    if ($isInEvent || $isInClusters) {
        // This sends the error into the Inertia "errors" prop
        throw ValidationException::withMessages([
            'delete' => 'Facility is associated with an event or cluster.'
        ]);
    }

    $facility->delete();
    // Success can still be a simple redirect
    return redirect()->route('facilities.index'); 
}
    }

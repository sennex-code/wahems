<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Participant;

class DownloadController extends Controller
{
    /**
     * Display a listing of the resource.
     */


public function downloadCertificate($participantId)
{
    $participant = Participant::with('event.facility')->findOrFail($participantId);

    // Pass data to a Blade view specifically designed for the PDF
    $longBond = [0, 0, 612.00, 936.00];

    $pdf = Pdf::loadView('pdf.certificate', compact('participant'))
              ->setPaper($longBond, 'portrait');

    return $pdf->download($participant->name . '-Certificate.pdf');
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

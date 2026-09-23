<?php

namespace App\Http\Controllers;

use App\Models\EventParticipant;
use App\Models\Participant;
use Inertia\Inertia;

class QrScannerController extends Controller
{
    public function index()
    {
        return  Inertia::render("QRScanner");
    }

    public function show($attendance_code)
    {

        $eventParticipant = EventParticipant::where("attendance_code", $attendance_code)->with('participant')->first();

        return Inertia::render("EventQr", ["participant" => $eventParticipant->participant, "attendance_code" => $attendance_code]);
    }
}

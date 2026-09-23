<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Participant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RegisterController extends Controller
{

    public function show($eventId)
    {

        $event = Event::with('clusters.facilities')->find($eventId);

        if ($event->is_registration_active === 0) {
            return Inertia::render('survey/Inactive', ["type" => "Event"]);
        }

        return Inertia::render("UserRegistration", ['event' => $event]);
    }
    public function store(Request $request, Event $event)
    {

        $fields = $request->validate([
            'first_name' => 'required|string',
            'middle_initial' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix' => 'nullable|string',
            'designation' => 'required|string',
            'age' => 'required|integer',
            'birthday' => 'required|date',
            'email' => 'required|email',
            'gender' => 'required|string',
            'mobile_number' => 'required|string',


            // CPD
            'cpd' => 'nullable|boolean',
            'prc_license' => 'nullable|string',
            'expiry_date' => 'nullable|string',

            // For Cluster Assembly and Training. Will add conditional later
            'cluster_id' => 'nullable|string',
            'facility_name' => 'nullable|string'
        ]);

        // Checks for existing participant

        return DB::transaction(function () use ($event, $fields) {

            $existingParticipant = Participant::where('email', $fields['email'])->where('first_name', $fields['first_name'])->where('last_name', $fields['last_name'])->first();

            // If user already exist, use that id instead.        
            if ($existingParticipant) {
                // Check wether user is already registered on the event.

                // Hindi nag papakita for some reason
                $eventParticipant = EventParticipant::where('event_id', $event->id)->where('participant_id', $existingParticipant->id)->first();

                if ($eventParticipant) {
                    // If yes, return back with error message
                    return null;
                }
                $participantId = $existingParticipant->id;
            } else {
                // If not, create new participant
                $newParticipant = Participant::create($fields);

                // And use that participant id instead
                $participantId = $newParticipant->id;
            }


            $uniqueCode = Str::random(10);

            // If the attendance code has been duplicated, create a new one. Loop until new
            while (EventParticipant::where('attendance_code', $uniqueCode)->exists()) {
                $uniqueCode = Str::random(10);
            }


            // DIko rin alam, need sa DB.
            $totalParticipants = EventParticipant::where('event_id', $event->id)->count();
            $reg_id = $totalParticipants + 1;


            $eventParticipant = EventParticipant::create([
                'event_id' => $event->id,
                'participant_id' => $participantId,
                // TEMPARARIEEEEEEEEE
                'cluster_id' => $event->type === "Cluster" ? $fields['cluster_id'] : null,
                'facility_name' => $event->type === "Training" || $event->type === "Cluster" ? $fields['facility_name'] : null,
                'registration_id' => $reg_id,
                'total_hours_attended' => 0,
                'attendance_code' => $uniqueCode,
            ]);

            $date_on = Carbon::parse($event->start_at);
            $end_at = Carbon::parse($event->end_at);

            if ($date_on->gt($end_at)) {
                [$date_on, $end_at] = [$end_at, $date_on]; // swap
            }

            // Handles generation of events, will loop through until reaches the end of the event. ie 10-02-2026 - 10-04-2026, will add 3 new rows to attendance table
            while ($date_on <= $end_at) {

                Attendance::create([
                    'event_participants_id' => $eventParticipant->id,
                    'date_on' => $date_on,
                    'hasAttended' => 0,
                    'hours_attended' => 0,
                ]);
                $date_on->addDay();
            }

            return  $eventParticipant;
        });
    }



    // Function used for participant registration
    public function userRegister(Request $request, Event $event)
    {
        $registrationResult = $this->store($request, $event);

        if (!$registrationResult) {

            return Inertia::render('AlreadyRegistered');
        }

        return redirect()->route('registered.show', [
            'attendance_code' => $registrationResult->attendance_code
        ]);
    }




    // Function used for facilitator 
    public function userCreate(Request $request, Event $event)
    {
        $registrationResult = $this->store($request, $event);

        if ($registrationResult) {
            return redirect()->back()->with('Success', "Participant registered!");
        }


        return redirect()->back()->with('Error', "Participant registered!");
    }

    public function update(Request $request, $eventId, $participantId)
    {
        $fields = $request->validate([
            'first_name' => 'required|string',
            'middle_initial' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix' => 'nullable|string',
            'designation' => 'required|string',
            'age' => 'required|integer',
            'birthday' => 'required|date',
            'email' => 'required|email',
            'gender' => 'required|string',
            'mobile_number' => 'required|string',
            // CPD
            'cpd' => 'nullable|boolean',
            'prc_license' => 'nullable|string',
            'expiry_date' => 'nullable|string',
            // For Cluster Assembly and Training. Will add conditional later
            'cluster_id' => 'nullable|integer',
            'facility_name' => 'nullable|string',

        ]);



        $eventParticipant = EventParticipant::where('participant_id', $participantId)->where('event_id', $eventId)->firstOrFail();

        $eventParticipant->update([
            'cluster_id' => $fields['cluster_id'] ?? null,
            'facility_name' => $fields['facility_name'] ?? null,
        ]);
        $participant = Participant::findOrFail($participantId);
        $participant->update($fields);



        return redirect()->back()->with('success', 'Participant updated successfully!');
    }
}

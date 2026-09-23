<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Facility;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class EventParticipantController extends Controller
{


    // Handle registration of participants to particular events

    public function show($eventId)
    {

        $event = Event::with('clusters.facilities')->find($eventId);

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


            // For Cluster Assembly and Training. Will add conditional later
            'cluster_id' => 'nullable|string',
            'facility_name' => 'nullable|string'
        ]);

        if (!empty($fields['middle_initial'])) {
    $fields['middle_initial'] = ucfirst(strtolower($fields['middle_initial']));

}


        // Checks for existing participant
        $existingParticipant = Participant::where('email', $fields['email'])->where('first_name', $fields['first_name'])->where('last_name', $fields['last_name'])->first();


        // If user already exist, use that id instead.        
        if ($existingParticipant) {
            // Check wether user is already registered on the event.

            // Hindi nag papakita for some reason
            $eventParticipant = EventParticipant::where('event_id', $event->id)->where('participant_id', $existingParticipant->id)->first();
            if ($eventParticipant) {
                // If yes, return back with error message
                return redirect()->back()->with('error', 'cannot');
            }
            $participantId = $existingParticipant->id;
        } else {
            // If not, create new participant
            dd($fields);
            $newParticipant = Participant::create($fields);

            // And use that participant id instead
            $participantId = $newParticipant->id;
        }

        // random code for event. idk ginaya kolang?
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



        return redirect()->back()->with('success', 'Participant successfully registered!');
    }

    public function destroy($eventParticipantId)
    {

        $eventParticipant = EventParticipant::findOrFail($eventParticipantId);
        $eventParticipant->delete();
        return redirect()->back();
    }

    public function search($eventId, Request $request)
    {

        $fields = $request->validate([
            'query' => 'required|string'
        ]);

        $event = EventParticipant::where('event_id', $eventId)->whereHas('participant');


        return response()->json(['searchedEvents' => $event]);
    }
}

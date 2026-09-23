<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\EventParticipant;

class AttendanceController extends Controller
{



    public function index(Request $request)
    {
        $search = $request->input("search");
        $filterBy = $request->input("filterBy", "All");
        $statusBy = $request->input("statusBy", "All");

        $events = Event::with(['clusters:id,event_id,cluster_name', 'creator:id,name'])->when($filterBy !== "All", function ($qq) use ($filterBy) {
            $qq->where("type", $filterBy);
        })->when($search, function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        })->when($statusBy !== "All", function ($q) use ($statusBy) {
            if ($statusBy === "Upcoming") {
                $q->whereDate('start_at', '>', today());
            } elseif ($statusBy === "Finished") {
                $q->whereDate('end_at', '<', today());
            } elseif ($statusBy === "Ongoing") {
                $q->whereDate('start_at', '<=', today())
                    ->whereDate('end_at', '>=', today());
            }
        })
         ->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Attendance', [
            'eventsList' => $events,
            "filters" => [
                "search" => $search,
                "filterBy" => $filterBy,
                "statusBy" => $statusBy
            ]
        ]);
    }


  public function update(Attendance $attendance, Request $request)
{
    $fields = $request->validate([
        'hasAttended' => 'required|boolean',
        'hours_attended' => 'required|integer'
    ]);

    $oldHours = $attendance->hours_attended;

    $attendance->fill($fields);

    // Only update if attendance info actually changed
    if ($attendance->isDirty()) {
        $attendance->save();
        $difference = $attendance->hours_attended - $oldHours;

        if ($difference !== 0) {
            $participant = $attendance->eventParticipant;
            $newTotal = $participant->total_hours_attended + $difference;

            // Ensure it never goes below zero
            $participant->total_hours_attended = max(0, $newTotal);
            $participant->save();
        }
    }

    return back();
}
public function presentAllParticipantToday($eventId)
{
    // Get the event or fail
    $event = Event::findOrFail($eventId);

    // Carbon date objects for start, end, today
    $start = \Carbon\Carbon::parse($event->start_at)->startOfDay();
    $end   = \Carbon\Carbon::parse($event->end_at)->endOfDay();
    $today = \Carbon\Carbon::today();

    // Only allow marking present if today is within range
    if (!$today->between($start, $end)) {
        return back()->with('error', 'Today is not within the event date range.');
    }

    $todayStr = $today->format('Y-m-d');
    $participantIds = $event->eventParticipants->pluck('id');

    // 1. Identify attendances that actually need updating
    $attendancesToUpdate = Attendance::whereIn('event_participants_id', $participantIds)
        ->where('date_on', $todayStr)
        ->where(function($q){
            $q->where('hasAttended', '!=', true)
              ->orWhere('hours_attended', '!=', 8);
        });

    $affectedParticipantIds = $attendancesToUpdate->pluck('event_participants_id');

    // 2. Update
    $attendancesToUpdate->update([
        'hasAttended' => true,
        'hours_attended' => 8,
    ]);

    // 3. Increment totals, only for affected participants (optional if 1 attendance per participant per day)
    if($affectedParticipantIds->count() > 0){
        EventParticipant::whereIn('id', $affectedParticipantIds)
            ->increment('total_hours_attended', 8);
    }

    return back()->with('success', 'All required participants marked present for today.');
}   

public function presentAll($attendanceCode)
{   
    $eventParticipant = EventParticipant::where('attendance_code', $attendanceCode)->firstOrFail();
    $event = Event::whereHas('eventParticipants', fn($q) => $q->where('id', $eventParticipant->id))->firstOrFail();
    $totalhours = $event->required_hours;
    $eventParticipant->update(['total_hours_attended' => $totalhours]);
    $hoursPerDay = 8;

    Attendance::where('event_participants_id', $eventParticipant->id)
        ->where(function($q) {
            $q->where('hasAttended', false)
              ->orWhereNull('hasAttended')
              ->orWhere('hours_attended', 0)
              ->orWhereNull('hours_attended');
        })
        ->update([
            'hasAttended' => true,
            'hours_attended' => $hoursPerDay,
        ]);
    return back();
}
    public function show(Request $request, Event $event)
    {


        $search = $request->input('search', "");
        $selectedDate = $request->input('date', $event->start_at);
        $dateRange = collect(CarbonPeriod::create($event->start_at, $event->end_at))->map(fn($d) => $d->format('Y-m-d'))->values();
        $eventParticipants = $event->eventParticipants();


        $attendeeCount = DB::table('attendance as a')->join('event_participants as ep', "ep.id", "=", "a.event_participants_id")->where('ep.event_id', $event->id)->where('a.date_on', $selectedDate)->select(DB::raw('SUM(CASE WHEN a.hasAttended = 1 THEN 1 ELSE 0 END) AS present'), DB::raw('SUM(CASE WHEN a.hasAttended = 0 THEN 1 ELSE 0 END) AS absent'))->first();

        $numberOfPaticipant = $event->eventParticipants()->count();
        $eventParticipants  = $event->eventParticipants()->with(['participant', 'attendances' => fn($q) => $q->where('date_on', $selectedDate)])
            // WHen search is present, use this function
            ->when($search, function ($q) use ($search) {
                // Only include participants on the search function
                $q->whereHas('participant', function ($q2) use ($search) {
                    // Find matching first_name
                    $q2->where('first_name', 'like', "%{$search}%")
                        // or matching last_name
                        ->orWhere("last_name", "like", "%{$search}%");
                });
            })
            ->paginate(5)->withQueryString();



        // Retrieveing all the present and absent on all days to be displayed as graph
        $presentAbsent = DB::table("event_participants as ep")->join("attendance as a", "ep.id", "=", "a.event_participants_id")
            ->where('ep.event_id', $event->id)->select('a.date_on', DB::raw('SUM(CASE WHEN a.hasAttended = 1 THEN 1 ELSE 0 END) AS present'), DB::raw('SUM(CASE WHEN a.hasAttended = 0 THEN 1 ELSE 0 END) AS absent'))
            ->groupBy('a.date_on')->get()->map(function ($value) {
                return [
                    "date_on" => Carbon::parse($value->date_on)->format('m/d/Y'),
                    "present" => $value->present,
                    "absent" => $value->absent
                ];
            });


        return Inertia::render('SpecificAttendance', [
            "attendeeCount" => $attendeeCount,
            "eventParticipants" => $eventParticipants,
            "numberOfParticipant" => $numberOfPaticipant,

            "selectedDate" => $selectedDate,
            "dateRange" => $dateRange,
            "event" => $event,

            "presentAbsent" => $presentAbsent,
            //Will be used fr search function
            "filters" => ["search" =>  $search]
        ]);
    }
}

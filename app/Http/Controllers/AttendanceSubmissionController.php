<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\EventParticipant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceSubmissionController extends Controller
{
    public function show($eventId)
    {


        return Inertia::render("attendance/AttendanceQr", ["eventId" => $eventId]);
    }
    public function patch($eventId, Request $request,)
    {
        $fields = $request->validate([
            "attendance_code" => "string|required",
            "date_on" => "string|required"
        ]);

        $eventParticipant = EventParticipant::where('attendance_code', $fields['attendance_code'])->where('event_id', $eventId)->get('id')->first();
        if (!$eventParticipant) {
            return back()->withErrors(["no_participant" => "There were no participant in this event with that attendance code"]);
        }

        $attendance = Attendance::where('date_on', $fields['date_on'])->where('event_participants_id', $eventParticipant->id)->first();

        if (!$attendance) {
            return back()->withErrors(["no_attendance" => "There is no attendance available for today"]);
        }

        if ($attendance->hasAttended === 1) {

            return back()->withErrors(['already_recorded' => "Attendace already recorded!"]);
        }
        $attendance->update(["hasAttended" => 1, "hours_attended" => 8]);



        return Inertia::render('attendance/AttendanceSuccess', ["eventId" => $eventId]);
    }



    public function verify($eventId)
    {


        return Inertia::render('attendance/VerifyAttendance', ["eventId" => $eventId]);
    }
}

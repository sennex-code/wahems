<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Survey;
use App\Models\SurveySubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{




    public function show(Event $event, Survey $survey)
    {
        // if survey is inactive
        if (!$survey->is_active) {
            return Inertia::render("survey/Inactive", ["type" => "Survey"]);
        }
        return Inertia::render("survey/VerifySurvey", [
            "event" => $event->id,
            "survey" => $survey->id,
        ]);
    }
    public function verify(Request $request, Event $event, Survey $survey)
    {
        $fields = $request->validate(["attendance_code" => "string|required"]);
        // First validate attendance code of event participant before answering survey
        $eventParticipant = EventParticipant::where("attendance_code", $fields["attendance_code"])->where("event_id", $event->id)->first();


        // Go back if there is no record
        if (!$eventParticipant) {
            return back()->withErrors(["attendance_code" => "None found in our record"]);
        }

        // Check if they already submitted
        $surveySubmission = SurveySubmission::where("event_participants_id", $eventParticipant->id)->where('survey_id', $survey->id)->first();

        if ($surveySubmission) {
            return back()->withErrors(["attendance_code" => "You've already submitted!"]);
        }

        // Save the event participant id to session for later
        session([
            "event_participant_id" => $eventParticipant->id,
        ]);

        // Redirect to survey form
        return redirect()->route("survey.show", ["event" => $event, "survey" => $survey]);
    }
}

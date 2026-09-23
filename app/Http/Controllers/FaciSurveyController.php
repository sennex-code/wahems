<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\FacilitatorSurvey;
use App\Models\FacilitatorQuestionnaire;
use App\Models\FacilitatorChoice;
use App\Models\FacilitatorSurveyAttempt;
use App\Models\FacilitatorEventParticipantAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaciSurveyController extends Controller
{
    /**
     * Verify participant belongs to event and redirect to index
     */
  /**
 * Verify participant belongs to event and redirect to index
 */


public function showVerificationForm($eventId)
{
    $event = Event::findOrFail($eventId);

    // ✅ Check if any survey for this event is active
    $survey = FacilitatorSurvey::where('event_id', $eventId)->first();

    if (!$survey || !$survey->isActive) {
        return Inertia::render("survey/Inactive", ["type" => "Evaluation"]);
    }

    return Inertia::render('facilitatorsurvey/VerifyFaciSurvey', [
        'event' => [
            'id' => $event->id,
            'name' => $event->name,
        ],
    ]);
}
public function verifyFaciSurvey(Request $request, $eventId)
{
    // Validate the attendance code
    $validated = $request->validate([
        'attendance_code' => 'required|string',
    ]);

    // Find the event
    $event = Event::findOrFail($eventId);

    // ✅ Use first() instead of firstOrFail() to avoid 404
    $eventParticipant = EventParticipant::where('event_id', $eventId)
        ->where('attendance_code', $validated['attendance_code'])
        ->first();

    // ✅ Return error response if participant not found
    if (!$eventParticipant) {
        return back()->withErrors([
            'attendance_code' => 'Invalid attendance code. Please try again.',
        ]);
    }

    // Redirect with event parameter in route
    return redirect()->route('facilitator-surveys.index', [
        'event' => $eventId,
        'participant' => $eventParticipant->id,
        'code' => $validated['attendance_code'],
    ]);
}

    /**
     * Display facilitator surveys with completion status
     */
   public function index(Request $request, $eventId)
{
    // Find the event
    $event = Event::findOrFail($eventId);

    // Get query parameters from request
    $participantId = $request->query('participant');
    $attendanceCode = $request->query('code');

    // Verify participant if provided
    $eventParticipant = null;
    if ($participantId) {
        $eventParticipant = EventParticipant::where('event_id', $eventId)
            ->where('id', $participantId)
            ->firstOrFail();

        // Double-check attendance code matches
        if ($attendanceCode && $eventParticipant->attendance_code !== $attendanceCode) {
            abort(403, 'Invalid attendance code.');
        }
    }

    // Get all facilitator surveys for this event with relationships
    $facilitatorSurveys = FacilitatorSurvey::where('event_id', $eventId)
        ->with([
            'facilitator:id,name',
            'questions:id,question_title,question_text,question_type,order',
        ])
        ->get();

    // Get all facilitator questionnaires with their choices
    $questionnaires = FacilitatorQuestionnaire::with([
        'questionOptions.choice:id,choice_text,choice_value'
    ])
        ->orderBy('order')
        ->get()
        ->map(function ($questionnaire) {
            return [
                'id' => $questionnaire->id,
                'question_title' => $questionnaire->question_title,
                'question_text' => $questionnaire->question_text,
                'question_type' => $questionnaire->question_type,
                'order' => $questionnaire->order,
                'choices' => $questionnaire->questionOptions->map(function ($option) {
                    return [
                        'id' => $option->choice_id,
                        'choice_text' => $option->choice->choice_text,
                        'choice_value' => $option->choice->choice_value,
                    ];
                })->values(),
            ];
        });

    // Get all facilitator choices
    $choices = FacilitatorChoice::orderBy('choice_value')->get();

    // Get completed surveys for this participant
    $completedSurveys = [];
    if ($eventParticipant) {
        $completedSurveys = FacilitatorSurveyAttempt::where('event_participant_id', $eventParticipant->id)
            ->where('status', 'submitted')
            ->pluck('survey_id')
            ->toArray();
    }

    // ✅ Get isActive status - all surveys for the event have the same value
    $isActive = ($facilitatorSurveys->first()?->isActive ?? true);

    if(!$isActive) {
       return Inertia::render("survey/Inactive", ["type" => "Survey"]);
    }

    // Format facilitator surveys for frontend
    $surveys = $facilitatorSurveys->map(function ($survey) use ($completedSurveys) {
        // Check if this survey is completed by the participant
        $isCompleted = in_array($survey->id, $completedSurveys);

        return [
            'id' => $survey->id,
            'facilitator_id' => $survey->facilitator_id,
            'facilitator_name' => $survey->facilitator->name,
            'event_id' => $survey->event_id,
            'survey_name' => $survey->name,
            'is_active' => (bool) $survey->is_active,  // ✅ Add this
            'isCompleted' => $isCompleted,
            'questions' => $survey->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question_title' => $question->question_title,
                    'question_text' => $question->question_text,
                    'question_type' => $question->question_type,
                    'order' => $question->order,
                ];
            })->values(),
        ];
    });

    return Inertia::render('facilitatorsurvey/AnswerFaciSurvey', [
        'event' => [
            'id' => $event->id,
            'name' => $event->name,
            'type' => $event->type,
            'start_at' => $event->start_at,
            'end_at' => $event->end_at,
        ],
        'participant' => $eventParticipant ? [
            'id' => $eventParticipant->id,
            'attendance_code' => $eventParticipant->attendance_code,
        ] : null,
        'facilitatorSurveys' => $surveys,
        'questionnaires' => $questionnaires,
        'choices' => $choices,
        'isActive' => $isActive,  // ✅ Pass global status
        'completedSurveys' => $completedSurveys,
    ]);
}
    /**
     * Store a newly submitted survey response
     */
   /**
 * Store a newly submitted survey response
 */
public function store(Request $request)
{
    // Validate input
    $validated = $request->validate([
        'event' => 'required|integer|exists:events,id',
        'survey' => 'required|integer|exists:facilitator_surveys,id',
        'answers' => 'required|array',
    ]);

    // ✅ Get participant from request body (from frontend form)
    $participantId = $request->input('participant');

    if (!$participantId) {
        return redirect()->back()->with('error', 'Participant not found');
    }

    // Verify participant belongs to event
    $eventParticipant = EventParticipant::where('event_id', $validated['event'])
        ->where('id', $participantId)
        ->firstOrFail();

    // Create survey attempt
    $attempt = FacilitatorSurveyAttempt::create([
        'survey_id' => $validated['survey'],
        'event_participant_id' => $eventParticipant->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    // Store answers
    foreach ($validated['answers'] as $questionId => $answer) {
        FacilitatorEventParticipantAnswer::create([
            'survey_attempt_id' => $attempt->id,
            'questionnaire_id' => (int) $questionId,
            'choice_id' => is_numeric($answer) ? (int) $answer : null,
            'answer_text' => is_array($answer) ? json_encode($answer) : (string) $answer,
        ]);
    }

    return redirect()->back()->with('success', 'Survey submitted successfully!');
}


    public function showResults($eventId, $surveyId)
    {
        $event = Event::findOrFail($eventId);
        $survey = FacilitatorSurvey::with('questions')->findOrFail($surveyId); // Get all attempts for this survey
        $attempts = FacilitatorSurveyAttempt::where('survey_id', $surveyId)
            ->with('eventParticipant.participant') // Load participant details
            ->with('answers') // Load answers for each attempt
            ->get();
        $questionnaires = FacilitatorQuestionnaire::with('questionOptions.choice')->orderBy('order')->get(  );
        

        // Format results for frontend
        $results = $attempts->map(function ($attempt) {
            return [
                'participant_id' => $attempt->event_participant_id,
                'participant_name' => $attempt->eventParticipant->participant->first_name . ' ' . $attempt->eventParticipant->participant->last_name,
                'submitted_at' => $attempt->submitted_at,
                'answers' => $attempt->answers->map(function ($answer) {
                    return [
                        'questionnaire_id' => $answer->questionnaire_id,
                        'choice_id' => $answer->choice_id,
                        'answer_text' => $answer->answer_text,
                    ];
                })->values(),
            ];
        });

return response()->json([
        'event' => [
            'id' => $event->id,
            'name' => $event->name,
        ],
        'survey' => [
            'id' => $survey->id,
            'name' => $survey->name,
        ],
        'results' => $results,
        'questionnaires' => $questionnaires->map(function ($q) {
            return [
                'id' => $q->id,
                'question_title' => $q->question_title,
                'question_text' => $q->question_text,
                'question_type' => $q->question_type,
                'order' => $q->order,
                'choices' => $q->questionOptions->map(function ($option) {
                    return [
                        'id' => $option->choice_id,
                        'choice_text' => $option->choice->choice_text,
                        'choice_value' => $option->choice->choice_value,
                    ];
                })->values(),
            ];
        }),
      
    ]);
}

public function getEventFacilitators($eventId)
{
    $facilitators = FacilitatorSurvey::where('event_id', $eventId)
        ->with('facilitator:id,name')
        ->get()
        ->map(function ($survey) {
            return [
                // This is the Facilitator's ID (e.g., User ID)
                'id' => $survey->facilitator_id, 
                // This is the actual name from the Facilitator model
                'name' => $survey->facilitator->name ?? 'Unknown',
                // This is the ID of the survey itself for this event/facilitator combo
                'survey_id' => $survey->id, 
            ];
        });

    return response()->json([
        'facilitators' => $facilitators,
    ]); 
}
}
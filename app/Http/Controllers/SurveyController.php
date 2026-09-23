<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventParticipantAnswer;
use App\Models\Question;
use App\Models\Survey;
use App\Models\SurveySubmission;
use App\Models\FacilitatorSurvey;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    public function index()
    {
        $surveys = Survey::select('id', 'event_id', 'is_active', 'title')
            ->with([
                'event:id,facility,type',
                'event.clusters:id,event_id,cluster_name,logo',
                'event.clusters.facilities:id,facility_name'
            ])
            ->has('event')
            ->latest()
            ->paginate(6)
            ->through(function ($survey) {
                // ✅ Get the first facilitator survey's is_active status for this event
                $facilitatorSurvey = FacilitatorSurvey::where('event_id', $survey->event_id)
                    ->select('isActive')
                    ->first();
                $hasfacilitatorSurvey = $facilitatorSurvey !== null;

                return [
                    'id' => $survey->id,
                    'event_id' => $survey->event_id,
                    'is_active' => $survey->is_active,
                    'title' => $survey->title,
                    'event' => $survey->event,
                    'is_facilitator_active' => $facilitatorSurvey?->isActive ?? false,
                    'has_facilitator_survey' => $hasfacilitatorSurvey,
                ];
            });

        return Inertia::render("Survey", [
            "surveys" => $surveys
        ]);
    }

    public function show(Event $event, Survey $survey)
    {
        // Check if there is a verified participant, session came from verification
        $eventParticipantId = session("event_participant_id");
        if (!$eventParticipantId) {
            // Return if not
            return redirect()->route("verification.show", [
                "event" => $event->id,
                "survey" => $survey->id,
            ]);
        }

        $questions = Question::with('surveyQuestionOptions')->get()->groupBy('category');;
        return Inertia::render("survey/AnswerSurvey", ["questions" => $questions, "event" => $event->id, "survey" => $survey->id]);
    }

    public function update(Survey $survey, Request $request)
    {
        // ✅ Update is_active for the survey
        if ($request->has('is_active')) {
            $survey->update([
                'is_active' => $request->boolean('is_active')
            ]);

            // ✅ Update is_active for all facilitator surveys in the same event
            FacilitatorSurvey::where('event_id', $survey->event_id)->update([
                'isActive' => $request->boolean('is_facilitator_active')
            ]);
        }

        // ✅ Update is_facilitator_active for facilitator surveys
        if ($request->has('is_facilitator_active')) {
            FacilitatorSurvey::where('event_id', $survey->event_id)->update([
                'isActive' => $request->boolean('is_facilitator_active')
            ]);
        }

        return back();
    }

    public function create(Request $request, Event $event, Survey $survey)
    {
        // Gets all the answer where [questionId => value]
        $fields = $request->validate([
            "answers" => "required|array",
            "answers.*" => "required"
        ]);

        // Retrieve the eventparticipantId
        $eventParticipantId = session("event_participant_id");

        if (!$eventParticipantId) {
            return redirect()->route('survey.finished', [
                'event' => $event->id,
                'survey' => $survey->id,
            ])->withErrors(['error' => 'This survey session is no longer valid.']);
        }

        // Put in transac so all or nothing
        DB::transaction(function () use ($eventParticipantId, $request, $fields, $survey) {
            $surveySubmit = SurveySubmission::create(["survey_id" => $survey->id, "event_participants_id" => $eventParticipantId, "submitted_at" => Carbon::now()]);

            // Rerieves answer form fields and make the KEY as questionid 
            foreach ($fields['answers'] as $questionId => $value) {
                // If value is number, will make text_answer as null since it is either a rating or a choice
                if (is_int($value)) {
                    EventParticipantAnswer::create(["survey_submission_id" => $surveySubmit->id, "question_id" => $questionId, "question_option_id" => $value, "text_answer" => null]);
                } elseif (is_array($value)) {
                    foreach ($value as $answer) {
                        EventParticipantAnswer::create(["survey_submission_id" => $surveySubmit->id, "question_id" => $questionId, "question_option_id" => $answer, "text_answer" => null]);
                    }
                } else {
                    // If not, store text
                    EventParticipantAnswer::create(["survey_submission_id" => $surveySubmit->id, "question_id" => $questionId, "question_option_id" => null, "text_answer" => $value]);
                }
            }
        });

        // After submission, clear the event_participant_id on session
        session()->forget('event_participant_id');
        return redirect()->route('survey.finished', [
            'event' => $event->id,
            'survey' => $survey->id
        ]);
    }

    public function finished(Event $event, Survey $survey)
    {
        return Inertia::render('survey/FinishedAnswer', [
            "event" => $event->id,
            "survey" => $survey->id,
        ]);
    }

    public function showQr($eventId, $surveyId)
    {
        $survey = Survey::findOrFail($surveyId);

        return Inertia::render("survey/SurveyQr", [
            "eventId" => $eventId,
            "surveyId" => $surveyId,
            "surveyName" => $survey->title
        ]);
    }

    public function showStatistics(Event $event, Survey $survey)
    {
        $stats = DB::table("survey_question_options")
            ->leftJoin(
                "event_participant_answers",
                "survey_question_options.id",
                "=",
                "event_participant_answers.question_option_id"
            )
            ->leftJoin("survey_submissions", function ($join) use ($survey) {
                $join->on(
                    "event_participant_answers.survey_submission_id",
                    "=",
                    "survey_submissions.id"
                )->where("survey_submissions.survey_id", $survey->id);
            })
            ->leftJoin(
                'questions',
                "survey_question_options.question_id",
                "=",
                "questions.id"
            )
            ->select(
                "survey_question_options.label",
                'questions.question_name',
                "questions.category",
                "survey_question_options.question_id",
                DB::raw("COUNT(survey_submissions.id) as answer_count"),
                DB::raw("AVG(survey_question_options.value) as avg_count")
            )
            ->groupBy(
                'survey_question_options.label',
                'survey_question_options.question_id',
                "questions.category",
                'questions.question_name',
                'survey_question_options.value'
            )->orderByRaw("
                        FIELD(questions.category,
                            'Training Content',
                            'Trainer and Delivery',
                            'Logistics and Overall Satisfaction',
                            'Open Ended'
                        )
                    ")
            ->orderBy('survey_question_options.question_id')
            ->orderBy('survey_question_options.value')
            ->get();

        $textAnswers = DB::table('event_participant_answers')
            ->join('survey_submissions', "event_participant_answers.survey_submission_id", "=", "survey_submissions.id")
            ->join("questions", "event_participant_answers.question_id", "=", "questions.id")
            ->where("survey_submissions.survey_id", $survey->id)
            ->select('event_participant_answers.id', "event_participant_answers.text_answer", "event_participant_answers.question_id", "questions.question_name")
            ->whereNotNull("event_participant_answers.text_answer")
            ->get();

        $stats = $stats->groupBy(['category', 'question_id']);
        $groupTextAnswer = $textAnswers->groupBy('question_name');

        $totalRespondents = $survey->surveySubmissions()->count();

        $participantsInfo = $survey->event
            ->eventParticipants()
            ->with('participant:id,email')->join('survey_submissions', "event_participants.id", "=", "survey_submissions.event_participants_id")->select([
                'event_participants.*',
                'survey_submissions.id as survey_submission_id',
            ])
            ->get()->map(function ($ep) {
                return [
                    "survey_submission_id" => $ep->survey_submission_id,
                    "email" => $ep->participant->email,
                    "event_participant_id" => $ep->id
                ];
            });

            $faciId = FacilitatorSurvey::where('event_id', $event->id)->pluck('id')->toArray();

            

        return Inertia::render("survey/SurveyStatistics", [
            "event" => $event->id,  
            "survey" => $survey->id,
            "stats" => $stats,
            "totalRespondents" => $totalRespondents,
            "participantsInfo" => $participantsInfo,
            "groupTextAnswer" => $groupTextAnswer,
            "surveyName" => $survey->title,
            "facilitatorSurveyId"=>$faciId
        ]);
    }
}
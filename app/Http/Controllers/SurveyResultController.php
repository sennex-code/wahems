<?php

namespace App\Http\Controllers;

use App\Exports\SurveyResultExport;
use Maatwebsite\Excel\Facades\Excel;

use App\Models\Question;
use App\Models\Survey;
use App\Models\SurveySubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;

use function PHPSTORM_META\map;

class SurveyResultController extends Controller
{

    public function index(Survey $survey)
    {


        $submissionId = $survey->surveySubmissions->first();
        $submissionId = $submissionId->id;

        // ultimate eager loder
        $all = $survey->surveySubmissions()->with([
            'eventParticipant:id,participant_id',
            'eventParticipant.participant:id,first_name,last_name,middle_initial,suffix,email',
            'eventParticipantAnswers:id,survey_submission_id,question_id,question_option_id,text_answer',
            'eventParticipantAnswers.questionOption:id,question_id,label'
        ])->select('id', 'survey_id', 'event_participants_id', 'created_at')->paginate(10)->through(function ($value) {
            return [
                "submitted_at" => Carbon::parse($value->created_at)->format('m/d/y'),
                'event_participant_id' => $value->event_participants_id,
                'first_name' => $value->eventParticipant->participant->first_name,
                'last_name' => $value->eventParticipant->participant->last_name,
                'middle_initial' => $value->eventParticipant->participant->middle_initial,
                'email' => $value->eventParticipant->participant->email,
                'suffix' => $value->eventParticipant->participant->suffix,
                'eventParticipantAnswers' => $value->eventParticipantAnswers
                    ->map(function ($answer) {
                        return [
                            'text_answer' => $answer->text_answer,
                            'question_id' => $answer->question_id,
                            'label' => $answer->questionOption->label ?? '',
                        ];
                    })
                    ->groupBy('question_id')
                    ->toArray(),
            ];
        });;


        $questions = Question::get()->map(function ($item) {
            return [
                "question_id" => $item->id,
                "category" => $item->category,
                "question_name" => $item->question_name,
                "type" => $item->type,


            ];
        });
        return Inertia::render("survey/SurveyXlxs", ["surveyParticipants" => $all, "questions" => $questions, "submissionId" => $submissionId,        "surveyName" => $survey->title]);
    }
    public function show(Survey $survey, SurveySubmission $submission)
    {

        // Eager load
        $userAnswers = $submission->load(['eventParticipant:id,participant_id', 'eventParticipant.participant:id,first_name,last_name,middle_initial,suffix,email', 'eventParticipantAnswers']);
        // Format
        $answer = [
            'survey_submission_id' => $userAnswers->id,
            'event_participant_id' => $userAnswers->eventParticipant->id,
            "participant_id" => $userAnswers->eventParticipant->participant->id,
            "email" => $userAnswers->eventParticipant->participant->email,
            "first_name" => $userAnswers->eventParticipant->participant->first_name,
            "last_name" => $userAnswers->eventParticipant->participant->last_name,
            "middle_initial" => $userAnswers->eventParticipant->participant->middle_initial,
            "suffix" => $userAnswers->eventParticipant->participant->suffix,
            "eventParticipantAnswers" => $userAnswers->eventParticipantAnswers->toArray(),
            "event_id" => $survey->event_id,
            "survey_id" => $survey->id,

        ];

        $questions = Question::with('surveyQuestionOptions')->get()->groupBy('category');

        return Inertia::render("survey/SpecificSubmission", ["questions" => $questions, "participant" => $answer]);
    }

    public function export($surveySubmissionId)
    {
        $survey = SurveySubmission::find($surveySubmissionId)->survey_id;
        $title = Survey::where('id', $survey)->first()->title;

        return Excel::download(new SurveyResultExport((int) $survey), $title . '.xlsx');
    }
}

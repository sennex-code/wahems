<?php

namespace App\Http\Controllers;

use App\Models\EventParticipant;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\QuestionChoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExamAttemptController extends Controller
{
    /**
     * GET: show page where participant enters attendance code
     */
    public function verifyParticipantEligibility($eventId, $examType)
    {
        abort_unless(in_array($examType, ['pre', 'post'], true), 404);

        // Ensure exam exists for this event/type
        $exam = Exam::query()
            ->where('event_id', $eventId)
            ->where('exam_type', $examType)
            ->firstOrFail();

        // If exam is currently closed
        if ($exam->isActive === 0) {
            return Inertia::render('survey/Inactive', ["type" => "Exam"]);
        }

        return Inertia::render('Exams/participantVerificationForPreExam', [
            'eventId' => (int) $eventId,
            'examType' => $examType,
            'examTitle' => $exam->title,
            'isActive' => $exam->isActive,
        ]);
    }

    /**
     * POST: receives attendance_code, creates/gets attempt, then renders exam page with attemptId+questions
     */
    public function startAttempt(Request $request, $eventId, $examType)
    {
        abort_unless(in_array($examType, ['pre', 'post'], true), 404);

        $data = $request->validate([
            'attendance_code' => ['required', 'string'],
        ]);

        return DB::transaction(function () use ($data, $eventId, $examType) {
            $exam = Exam::query()
                ->where('event_id', $eventId)
                ->where('exam_type', $examType)
                ->lockForUpdate()
                ->firstOrFail();

            $participant = EventParticipant::query()
                ->where('event_id', $eventId)
                ->where('attendance_code', $data['attendance_code'])
                ->first();

            if (!$participant) {
                return back()->withErrors([
                    'attendance_code' => 'Invalid attendance code for this event.',
                ]);
            }

            $attempt = ExamAttempt::query()->firstOrCreate(
                [
                    'exam_id' => $exam->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'score' => 0,
                    'started_at' => now(),
                ]
            );

            // Load questions with choices
            $questions = $exam->examQuestionBank()
                ->with('choices')
                ->get();

            // Set number_of_items the first time attempt is created
            if ($attempt->wasRecentlyCreated) {
                $attempt->number_of_items = $questions->count();
                $attempt->save();
            }

            if ($attempt->submitted_at) {
                return back()->withErrors([
                    'attendance_code' => 'You already submitted this exam.',
                ]);
            }

            return Inertia::render('Exams/preEventExam', [
                'attemptId' => $attempt->id,
                'questions' => $questions,
                'examType' => $examType,
                'eventId' => (int) $eventId,
                'examTitle' => $exam->title,
                'isActive' => $exam->isActive,
            ]);
        });
    }

    /**
     * POST: submit answers using existing attempt_id
     */
    public function submit(Request $request)
    {
        $data = $request->validate([
            'attempt_id' => ['required', 'integer', 'exists:exam_attempts,id'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:exams_questions,id'],
            'answers.*.selected_choice_id' => ['required', 'integer', 'exists:question_choices,id'],
        ]);

        return DB::transaction(function () use ($data) {
            $attempt = ExamAttempt::query()->lockForUpdate()->findOrFail($data['attempt_id']);

            if ($attempt->submitted_at) {
                abort(422, 'Attempt already submitted.');
            }

            $exam = Exam::query()->findOrFail($attempt->exam_id);

            // ensure submitted questions belong to this exam
            $allowedQuestionIds = $exam->examQuestionBank()->pluck('id')->all();
            $allowed = array_flip($allowedQuestionIds);

            foreach ($data['answers'] as $a) {
                if (!isset($allowed[$a['question_id']])) {
                    abort(422, "Question {$a['question_id']} does not belong to this exam.");
                }

                // ensure choice belongs to question
                $choiceOk = QuestionChoice::query()
                    ->where('id', $a['selected_choice_id'])
                    ->where('question_id', $a['question_id'])
                    ->exists();

                if (!$choiceOk) {
                    abort(422, "Choice {$a['selected_choice_id']} does not belong to question {$a['question_id']}.");
                }

                ExamAttemptAnswer::query()->updateOrCreate(
                    [
                        'attempt_id' => $attempt->id,
                        'question_id' => $a['question_id'],
                    ],
                    [
                        'selected_choice_id' => $a['selected_choice_id'],
                    ]
                );
            }

            $score = ExamAttemptAnswer::query()
                ->where('attempt_id', $attempt->id)
                ->whereHas('selectedChoice', function ($q) {
                    $q->where('is_correct', 1);
                })
                ->count();

            $attempt->update([
                'score' => $score,
                'submitted_at' => now(),
            ]);

            return redirect()->route('examAttempts.showScore', [
                'attemptId' => $attempt->id,
            ]);
        });
    }

    /**
     * GET: show score page for an attempt
     */
    public function score($attemptId)
    {
        $attempt = ExamAttempt::with('exam')->findOrFail($attemptId);

        return Inertia::render('Exams/ExamSubmissionConfirmation', [
            'score' => $attempt->score,
            'examTitle' => $attempt->exam->title,
        ]);
    }

    /**
     * Toggle exam isActive state
     */
    public function setIsActive($eventId, $examType, $isActive)
    {
        $exam = Exam::where('event_id', $eventId)->where('exam_type', $examType)->firstOrFail();
        $exam->isActive = $isActive;
        $exam->save();
    }
}
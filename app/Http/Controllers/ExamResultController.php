<?php

namespace App\Http\Controllers;

use App\Exports\EventExamRecordsExport;
use App\Models\Event;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExamResultController extends Controller
{
    public function index()
    {
        $events = Event::query()
            ->whereHas('exams', fn ($q) => $q->where('exam_type', 'pre'))
            ->whereHas('exams', fn ($q) => $q->where('exam_type', 'post'))
            ->with([
                // Clusters + images + each cluster's facilities
                'clusters' => fn ($q) => $q->select(['id', 'event_id', 'cluster_name', 'logo']),
                'clusters.facilities' => fn ($q) => $q->select(['id', 'cluster_id', 'facility_name']),

                // Exams (pre and post types)
                'exams' => fn ($q) => $q->whereIn('exam_type', ['pre', 'post'])
                    ->select(['id', 'event_id', 'exam_type', 'title', 'bank', 'isActive']),

                // Attempts
                'exams.attempts' => fn ($q) => $q->select([
                    'id', 'exam_id', 'participant_id', 'score', 'submitted_at'
                ]),

                // ExamParticipant
                'exams.attempts.participant' => fn ($q) => $q->select([
                    'id', 'event_id', 'participant_id', 'attendance_code',
                ]),

                // Participant details
                'exams.attempts.participant.participant' => fn ($q) => $q->select([
                    'id', 'first_name', 'middle_initial', 'last_name', 'suffix', 'designation', 'email',
                ]),

                // Answers (only answered questions)
                'exams.attempts.answers' => fn ($q) => $q->select(['id', 'attempt_id', 'question_id', 'selected_choice_id']),

                // Questions (including soft deleted)
                'exams.attempts.answers.question' => function ($q) {
                    $q->withTrashed()->select(['id', 'question_text']);
                },

                // Choices (including soft deleted)
                'exams.attempts.answers.question.choices' => function ($q) {
                    $q->withTrashed()->select(['id', 'question_id', 'choice_text', 'is_correct']);
                },

                // Selected choice relationship
                'exams.attempts.answers.selectedChoice' => function ($q) {
                    $q->select(['id', 'question_id', 'choice_text', 'is_correct']);
                },
            ])
            ->orderByDesc('id')
            ->paginate(6);

        return Inertia::render('ExamResult', [
            'events' => $events,
        ]);
    }

    // NEW: download an Excel for one event
    public function exportEvent(int $eventId)
    {
        // optional: authorization check here
        $event = Event::select(['id', 'name'])->findOrFail($eventId);

        $safe = preg_replace('/[\\\\\/:*?"<>|]+/', '-', $event->name);
        $fileName = "exam-records-event-{$event->id}-{$safe}.xlsx";

        return Excel::download(new EventExamRecordsExport($event->id), $fileName);
    }
}
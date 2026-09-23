<?php

namespace App\Exports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EventExamRecordsExport implements FromArray, WithHeadings, ShouldAutoSize
{
    public function __construct(private readonly int $eventId)
    {
    }

    public function headings(): array
    {
        return [
            'Event',
            'Participant Name',
            'Email',
            'Designation',
            'Attendance Code',
            'Pre Score',
            'Pre Items',
            'Pre Submitted At',
            'Post Score',
            'Post Items',
            'Post Submitted At',
        ];
    }

    public function array(): array
    {
        // Match the structure you already use in the UI
        $event = Event::query()
            ->where('id', $this->eventId)
            ->with([
                'exams' => fn ($q) => $q->whereIn('exam_type', ['pre', 'post'])
                    ->select(['id', 'event_id', 'exam_type', 'title', 'bank']),

                'exams.attempts' => fn ($q) => $q->select([
                    'id', 'exam_id', 'participant_id', 'score', 'submitted_at'
                ]),

                // Attempt::participant => EventParticipant
                'exams.attempts.participant' => fn ($q) => $q->select([
                    'id',
                    'event_id',
                    'participant_id',
                    'attendance_code',
                ]),

                // EventParticipant::participant => Participant
                'exams.attempts.participant.participant' => fn ($q) => $q->select([
                    'id',
                    'first_name',
                    'middle_initial',
                    'last_name',
                    'suffix',
                    'designation',
                    'email',
                ]),

                // just for counting items
                'exams.attempts.answers:id,attempt_id,question_id,selected_choice_id',
            ])
            ->select(['id', 'name', 'start_at', 'end_at'])
            ->firstOrFail();

        $formatName = function ($p): string {
            if (!$p) return 'Unknown Participant';
            $mi = $p->middle_initial ? ' ' . $p->middle_initial . '.' : '';
            $suf = $p->suffix ? ' ' . $p->suffix : '';
            return trim($p->first_name . $mi . ' ' . $p->last_name . $suf);
        };

        // Group by EventParticipant ID (attempt.participant_id points to event_participants.id)
        $rowsByEpId = [];

        foreach ($event->exams as $exam) {
            foreach ($exam->attempts as $attempt) {
                $ep = $attempt->participant; // EventParticipant
                if (!$ep) continue;

                $epId = $ep->id;
                $p = $ep->participant; // Participant

                if (!isset($rowsByEpId[$epId])) {
                    $rowsByEpId[$epId] = [
                        'event' => $event->name,
                        'name' => $formatName($p),
                        'email' => $p->email ?? '',
                        'designation' => $p->designation ?? '',
                        'attendance_code' => $ep->attendance_code ?? '',
                        'pre_score' => '',
                        'pre_items' => '',
                        'pre_submitted_at' => '',
                        'post_score' => '',
                        'post_items' => '',
                        'post_submitted_at' => '',
                    ];
                }

                // Items = count of answers submitted on that attempt
                $items = $attempt->answers?->count() ?? 0;

                if ($exam->exam_type === 'pre' && $attempt->submitted_at) {
                    $rowsByEpId[$epId]['pre_score'] = $attempt->score ?? 0;
                    $rowsByEpId[$epId]['pre_items'] = $items;
                    $rowsByEpId[$epId]['pre_submitted_at'] = $attempt->submitted_at;
                }

                if ($exam->exam_type === 'post' && $attempt->submitted_at) {
                    $rowsByEpId[$epId]['post_score'] = $attempt->score ?? 0;
                    $rowsByEpId[$epId]['post_items'] = $items;
                    $rowsByEpId[$epId]['post_submitted_at'] = $attempt->submitted_at;
                }
            }
        }

        $out = [];
        foreach ($rowsByEpId as $r) {
            $out[] = [
                $r['event'],
                $r['name'],
                $r['email'],
                $r['designation'],
                $r['attendance_code'],
                $r['pre_score'],
                $r['pre_items'],
                $r['pre_submitted_at'],
                $r['post_score'],
                $r['post_items'],
                $r['post_submitted_at'],
            ];
        }

        return $out;
    }
}
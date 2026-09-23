<?php

namespace App\Exports;

use App\Models\Question;
use App\Models\SurveySubmission;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SurveyResultExport implements FromCollection, WithHeadings
{
    protected Collection $questions;

    public function __construct(private int $surveySubmissionId)
    {
        $this->questions = Question::all();
    }

    public function headings(): array
    {
        $baseHeadings = [
            'Submitted At',
            'Event Participant ID',
            'First Name',
            'Last Name',
            'Middle Initial',
            'Suffix',
            'Email',
        ];

        $questionHeadings = $this->questions
            ->map(function ($question, $index) {
                return 'Q' . ($index + 1) . ' - ' . $question->question_name;
            })
            ->toArray();

        return [...$baseHeadings, ...$questionHeadings];
    }

    public function collection(): Collection
    {
        $submissions = SurveySubmission::with([
            'eventParticipant:id,participant_id',
            'eventParticipant.participant:id,first_name,last_name,middle_initial,suffix,email',
            'eventParticipantAnswers:id,survey_submission_id,question_id,question_option_id,text_answer',
            'eventParticipantAnswers.questionOption:id,question_id,label',
        ])
            ->select('id', 'survey_id', 'event_participants_id', 'created_at')
            ->where('survey_id', $this->surveySubmissionId)
            ->get();

        return $submissions->map(function ($submission) {
            $groupedAnswers = $submission->eventParticipantAnswers->groupBy('question_id');

            $row = [
                'Submitted At' => $submission->created_at->format('m/d/y'),
                'Event Participant ID' => $submission->event_participants_id,
                'First Name' => $submission->eventParticipant->participant->first_name ?? '',
                'Last Name' => $submission->eventParticipant->participant->last_name ?? '',
                'Middle Initial' => $submission->eventParticipant->participant->middle_initial ?? '',
                'Suffix' => $submission->eventParticipant->participant->suffix ?? '',
                'Email' => $submission->eventParticipant->participant->email ?? '',
            ];

            foreach ($this->questions as $index => $question) {
                $answers = $groupedAnswers->get($question->id, collect());

                $cellValue = match ($question->type) {
                    'text' => $answers->pluck('text_answer')
                        ->filter()
                        ->join(', '),

                    'checkbox' => $answers->map(function ($answer) {
                        return $answer->questionOption->label ?? '';
                    })
                        ->filter()
                        ->join(', '),

                    default => $answers->map(function ($answer) {
                        return $answer->questionOption->label ?? '';
                    })
                        ->filter()
                        ->join(', '),
                };

                $row['Q' . ($index + 1) . ' - ' . $question->question_name] = $cellValue;
            }

            return $row;
        });
    }
}

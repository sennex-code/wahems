<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamBankQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamSetupController extends Controller
{
    /**
     * Create PRE and POST exams for an event and attach all questions from the specified bank.
     *
     * Request:
     * - event_id (int)
     * - bank ('private'|'lgu')
     */
    public function createPrePostForEvent(Request $request)
    {
        $data = $request->validate([
            'event_id' => ['required', 'integer'],
            'bank' => ['required', 'in:private,lgu'],
        ]);

        return DB::transaction(function () use ($data) {
            $eventId = $data['event_id'];
            $bank = $data['bank'];

            // Create PRE exam (unique per event_id + exam_type)
            $pre = Exam::create([
                'event_id' => $eventId,
                'exam_type' => 'pre',
                'bank' => $bank,
                'title' => strtoupper($bank) . ' Pre Exam',
            ]);

            // Create POST exam
            $post = Exam::create([
                'event_id' => $eventId,
                'exam_type' => 'post',
                'bank' => $bank,
                'title' => strtoupper($bank) . ' Post Exam',
            ]);

            $questionIds = ExamBankQuestion::query()
                ->where('bank', $bank)
                ->pluck('id')
                ->all();

            // Attach SAME questions to both exams
            $pre->examQuestionBank()->sync($questionIds);
            $post->examQuestionBank()->sync($questionIds);

            return response()->json([
                'pre_exam_id' => $pre->id,
                'post_exam_id' => $post->id,
                'question_count' => count($questionIds),
            ]);
        });
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $table = 'exams';

    protected $fillable = [
        'event_id',
        'exam_type', // pre|post
        'bank',      // private|lgu
        'title',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'id');
    }

    /**
     * Questions attached to this exam.
     *
     * IMPORTANT:
     * - exams_questions = question BANK table
     * - exam_questions  = PIVOT table (exam_id, question_id)
     */
    public function examQuestionBank(): BelongsToMany
    {
        return $this->belongsToMany(
            ExamBankQuestion::class,
            'exam_questions',  // ✅ pivot table (NOT exams_questions)
            'exam_id',         // pivot column referencing exams.id
            'question_id'      // pivot column referencing exams_questions.id
        )->withTimestamps();
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id', 'id');
    }
}
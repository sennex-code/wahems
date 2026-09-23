<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttemptAnswer extends Model
{
    protected $table = 'exam_attempt_answers';

    protected $fillable = [
        'attempt_id',
        'question_id',
        'selected_choice_id',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id', 'id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ExamBankQuestion::class, 'question_id', 'id');
    }

    public function selectedChoice(): BelongsTo
    {
        return $this->belongsTo(QuestionChoice::class, 'selected_choice_id', 'id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\QuestionChoice;

class ExamBankQuestion extends Model
{
    use SoftDeletes;
    protected $table = 'exams_questions'; // ✅ question bank table

    protected $fillable = [
        'bank',
        'question_text',
    ];

    /**
     * Choices for this question.
     * Your controller must eager-load: examQuestionBank.choices
     */
    public function choices(): HasMany
    {
        return $this->hasMany(QuestionChoice::class, 'question_id', 'id');
    }

    public function exams(): BelongsToMany
    {
        return $this->belongsToMany(
            Exam::class,
            'exam_questions',  // ✅ pivot table
            'question_id',     // pivot column referencing exams_questions.id
            'exam_id'          // pivot column referencing exams.id
        )->withTimestamps();
    }
}
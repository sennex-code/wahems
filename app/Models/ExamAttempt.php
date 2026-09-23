<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttempt extends Model
{
    protected $table = 'exam_attempts';

    protected $fillable = [
        'exam_id',
        'participant_id',
        'number_of_items',
        'score',
        'started_at',
        'submitted_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id', 'id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(EventParticipant::class, 'participant_id', 'id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAttemptAnswer::class, 'attempt_id', 'id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilitatorSurveyAttempt extends Model
{
    protected $table = 'facilitator_survey_attempts';

    protected $fillable = [
        'survey_id',
        'event_participant_id',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(FacilitatorSurvey::class, 'survey_id');
    }

    public function eventParticipant(): BelongsTo
    {
        return $this->belongsTo(EventParticipant::class, 'event_participant_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(FacilitatorEventParticipantAnswer::class, 'survey_attempt_id');
    }
}
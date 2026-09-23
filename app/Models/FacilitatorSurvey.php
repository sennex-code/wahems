<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilitatorSurvey extends Model
{
    protected $table = 'facilitator_surveys';

    protected $fillable = [
        'facilitator_id',
        'event_id',
        'name',
        'isActive',
    ];

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(Facilitator::class, 'facilitator_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(
            FacilitatorQuestionnaire::class,
            'facilitator_questions',
            'survey_id',
            'questionnaire_id'
            
        );
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(FacilitatorSurveyAttempt::class, 'survey_id');
    }

    public function participantAnswers(): HasMany
    {
        return $this->hasMany(FacilitatorEventParticipantAnswer::class, 'survey_id');
    }
}
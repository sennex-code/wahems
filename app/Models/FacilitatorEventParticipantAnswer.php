<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilitatorEventParticipantAnswer extends Model
{
    protected $table = 'facilitator_event_participant_answers';

    protected $fillable = [
        'survey_attempt_id',
        'questionnaire_id',
        'choice_id',
        'answer_text',
    ];

    public function surveyAttempt(): BelongsTo
    {
        return $this->belongsTo(FacilitatorSurveyAttempt::class, 'survey_attempt_id');
    }

    public function questionnaire(): BelongsTo
    {
        return $this->belongsTo(FacilitatorQuestionnaire::class, 'questionnaire_id');
    }

    public function choice(): BelongsTo
    {
        return $this->belongsTo(FacilitatorChoice::class, 'choice_id');
    }
}
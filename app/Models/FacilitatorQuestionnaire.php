<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilitatorQuestionnaire extends Model
{
    protected $table = 'facilitator_questionnaire';

    protected $fillable = [
        'question_title',
        'question_text',
        'question_type',
        'order',
    ];

    public function surveys(): BelongsToMany
    {
        return $this->belongsToMany(
            FacilitatorSurvey::class,
            'facilitator_questions',
            'questionnaire_id',
            'survey_id'
        );
    }

    public function questionOptions(): HasMany
    {
        return $this->hasMany(FacilitatorQuestionOption::class, 'questionnaire_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(FacilitatorEventParticipantAnswer::class, 'questionnaire_id');
    }
}
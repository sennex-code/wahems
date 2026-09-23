<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilitatorQuestionOption extends Model
{
    protected $table = 'facilitator_question_option';

    protected $fillable = [
        'questionnaire_id',
        'choice_id',
    ];

    public function questionnaire(): BelongsTo
    {
        return $this->belongsTo(FacilitatorQuestionnaire::class, 'questionnaire_id');
    }

    public function choice(): BelongsTo
    {
        return $this->belongsTo(FacilitatorChoice::class, 'choice_id');
    }
}
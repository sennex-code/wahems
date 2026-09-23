<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventParticipantAnswer extends Model
{
    protected $fillable  = [

        "survey_submission_id",
        "question_id",
        "question_option_id",
        "text_answer"
    ];


    public function surveySubmission()
    {
        return $this->belongsTo(SurveySubmission::class);
    }
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function questionOption()
    {
        return $this->belongsTo(SurveyQuestionOption::class);
    }
}

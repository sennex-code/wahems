<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveySubmission extends Model
{



    protected $fillable = [
        "survey_id",
        "event_participants_id",
        "submitted_at"
    ];
    public function survey()
    {
        return $this->belongsTo(Survey::class, "survey_id");
    }

    public function eventParticipantAnswers()
    {
        return $this->hasMany(EventParticipantAnswer::class, "survey_submission_id");
    }

    public function eventParticipant()
    {
        return $this->belongsTo(EventParticipant::class, "event_participants_id");
    }
}

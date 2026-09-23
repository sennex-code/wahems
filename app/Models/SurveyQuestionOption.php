<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveyQuestionOption extends Model
{
    protected $fillable = [
        "question_id",
        "label",
        "type",
        "value"
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, "question_id");
    }
}

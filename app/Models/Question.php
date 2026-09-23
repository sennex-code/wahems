<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ["question_name", "type", "category"];



    public function surveyQuestionOptions()
    {
        return $this->hasMany(SurveyQuestionOption::class, "question_id");
    }
}

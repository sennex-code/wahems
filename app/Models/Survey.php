<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Survey extends Model
{


    protected $fillable = [
        "event_id",
        "title",
        "is_active"
    ];



    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function surveySubmissions()
    {
        return $this->hasMany(SurveySubmission::class);
    }
}

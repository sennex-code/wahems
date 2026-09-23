<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventParticipant extends Model
{
    protected $fillable = ['event_id', 'participant_id', 'registration_id', 'participant_cluster', 'total_hours_attended', 'attendance_code', 'image_cert', 'cluster_id', 'facility_name'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
    public function cluster()
    {
        return $this->belongsTo(Cluster::class);
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'event_participants_id');
    }




    public function surveySubmission()
    {
        return $this->hasMany(SurveySubmission::class);
    }


    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'participant_id', 'id');
    }
}

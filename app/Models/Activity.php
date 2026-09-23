<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'event_name',
        'organizer_email',
        
        'start_date',
        'start_time', 

        'end_date',
        'end_time',
        'status',
        'google_event_id',
        "user_id"
    ];

    public $timestamps = false;

    public function participants()
    {
        return $this->hasMany(ActivityParticipant::class);
    }
}
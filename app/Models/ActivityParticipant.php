<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityParticipant extends Model
{
    protected $fillable = [
        'activity_id',
        'participant_name',
        'participant_email',
    ];

    public $timestamps = false;

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}
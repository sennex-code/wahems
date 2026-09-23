<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{


    protected $table = "attendance";
    // DIko pa alam ano ginagawa neto
    protected $fillable = ['event_participants_id', 'date_on', 'hasAttended', 'hours_attended'];
    protected $appends = [
        "hours_attended_color_sceheme"
    ];


    public function getHoursAttendedColorScehemeAttribute()
    {

        $hours = $this->attributes['hours_attended'] ?? null;

        return match (true) {

            $hours >= 1 && $hours <= 3 => '#ef4444', // red
            $hours >= 4 && $hours <= 5 => '#f59e0b', // amber
            $hours >= 6 => '#22c55e', // green
            default => 'gray', // gray
        };
    }



    public function eventParticipant()
    {
        return $this->belongsTo(EventParticipant::class, 'event_participants_id');
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'event_participants_id');
    }
}

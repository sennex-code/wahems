<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Participant extends Model
{
    protected $fillable = [
        "first_name",
        "middle_initial",
        "last_name",
        "suffix",
        "designation",
        "age",
        "birthday",
        "email",
        "gender",
        "mobile_number",
        "cpd",
        "prc_license",
        "expiry_date"
    ];



    protected $appends = ["full_name"];


    // append full_name to be all uppercase
    public function getFullNameAttribute()
    {
        return strtoupper(
            trim(
                $this->last_name .
                    ($this->suffix ? ' ' . $this->suffix : '') .
                    ', ' .
                    $this->first_name .
                    ($this->middle_initial ? ' ' . $this->middle_initial : '')
            )
        );
    }

    public function eventParticipant(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function clusters()
    {
        // If the cluster_id is on the event_participant pivot table:
        return $this->belongsTo(Cluster::class, 'cluster_id');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_participants', 'participant_id', 'event_id')
            ->withPivot('registration_id')
            ->withTimestamps();
    }

   
}

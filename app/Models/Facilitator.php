<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facilitator extends Model
{
    //
    use SoftDeletes;
    protected $table = "facilitators";

    protected $fillable = [
        'name',
    ];



    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_facilitator', 'facilitator_id', 'event_id')->withTimestamps();
    }
}


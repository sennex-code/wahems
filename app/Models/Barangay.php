<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'barangay', 'psgc_10_digit_code');
    }
    public function municipality()
    {
        return $this->belongsTo(Municipality::class, 'municipality_id');
    }
}

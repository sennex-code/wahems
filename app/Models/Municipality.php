<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipality extends Model
{

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'municipality', 'psgc_10_digit_code');
    }
    public function province()
    {
        return $this->belongsTo(Province::class);
    }
    public function Barangays(): HasMany
    {
        return $this->hasMany(Barangay::class, 'municipality_id', 'id');
    }
}

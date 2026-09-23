<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'region', 'psgc_10_digit_code');
    }
    public function provinces(): HasMany
    {
        return $this->hasMany(Province::class, 'region_id', 'id');
    }
}

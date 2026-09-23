<?php

namespace App\Models;

use Faker\Provider\sv_SE\Municipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    //


    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'province', 'psgc_10_digit_code');
    }
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function municipalities(): HasMany
    {
        return $this->hasMany(Municipality::class, 'province_id', 'id');
    }
}

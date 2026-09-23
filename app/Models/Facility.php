<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    protected $table = "facilities";

    public $timestamps = false;
    protected $fillable = [
        'facility_name',
        'code',
        'short_code',
        'region_code',
        'province_code',
        'municipality_code',
        'barangay_code',
    ];


    // foreignKey is the name of the FK on the related class, while ownerkey is the name of the FK on the parent table.
    public function region(): BelongsTo
    {

        return $this->belongsTo(Region::class, 'region_code', 'psgc_10_digit_code');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'psgc_10_digit_code');
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipality_code', 'psgc_10_digit_code');
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'barangay_code', 'psgc_10_digit_code');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function clusters(): BelongsToMany
    {
        return $this->belongsToMany(Cluster::class, 'cluster_facility', 'facility_id', 'cluster_id');
    }
}

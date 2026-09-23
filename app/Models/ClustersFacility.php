<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClustersFacility extends Model
{
    protected $fillable = [
        'cluster_id',
        'facility_code'
    ];
    protected $table = 'cluster_facility';

    
}

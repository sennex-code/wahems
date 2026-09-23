<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilitatorChoice extends Model
{
    protected $table = 'facilitator_choices';

    protected $fillable = [
        'choice_text',
        'choice_value',
    ];

    public function questionOptions(): HasMany
    {
        return $this->hasMany(FacilitatorQuestionOption::class, 'choice_id');
    }
}
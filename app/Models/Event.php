<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Event extends Model
{

    protected $fillable = [
        'code',
        'name',
        'facility_code',
        'start_at',
        'end_at',
        'user_id',
        'type',
        'facility',
        'region',
        'province',
        'municipality',
        'barangay',
        'address',
        'logo',
        'leader',
        'position',
        'required_hours',
        'is_registration_active'

    ];
    protected $casts = [
        'start_at' => 'date',
        'end_at' => 'date',
    ];

    protected $appends = ['status',];

    public function getStatusAttribute()
    {
        $today = today();

        if ($this->start_at > $today) {
            return 'Upcoming';
        }

        if ($this->end_at < $today) {
            return 'Finished';
        }

        return 'Ongoing';
    }


    public function eventRegion()
    {
        return $this->belongsTo(Region::class, 'region', 'psgc_10_digit_code');
    }

    public function eventProvince()
    {
        return $this->belongsTo(Province::class, 'province', 'psgc_10_digit_code');
    }

    public function eventMunicipality()
    {
        return $this->belongsTo(Municipality::class, 'municipality', 'psgc_10_digit_code');
    }

    public function eventBarangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay', ownerKey: 'psgc_10_digit_code');
    }

    public function facilityCode()
    {
        return $this->belongsTo(Facility::class, 'facility_code', 'code');
    }




    public function clusters(): HasMany
    {
        return $this->hasMany(Cluster::class);
    }


    public function eventParticipants(): HasMany
    {
        return $this->hasMany(EventParticipant::class, 'event_id');
    }

    public function participants()
    {
        return $this->belongsToMany(Participant::class, 'event_participants')
            ->withPivot('cluster_id') // Safe to add
            ->withTimestamps();       // Also safe, adds created_at/updated_at
    }
    public function logo(): string | null
    {
        // if ($this->logo) {
        //     return asset('storage/' . $this->logo);
        // }
        // return null;



        // Deployment, transform path link as URL
        if (! $this->logo) {
            return null;
        }
        // Nag rred pag may inteliphesne kaya kinakbit ko to, diko alam     no gainagawa
        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk = Storage::disk('wahems_storage');

        return $disk->temporaryUrl($this->logo, now()->addMinutes(5));
    }



    public function getLogoBase64Attribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        try {
            /** @var \Illuminate\Contracts\Filesystem\Filesystem|\Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('wahems_storage');

            if (! $disk->exists($this->logo)) {
                return null;
            }

            $file = $disk->get($this->logo);
            $mimeType = $disk->mimeType($this->logo) ?? 'image/png';

            return 'data:' . $mimeType . ';base64,' . base64_encode($file);
        } catch (\Throwable $e) {
            return null;
        }
    }


    public function survey()
    {
        return $this->hasOne(Survey::class);
    }
    public function exams()
    {
        return $this->hasMany(\App\Models\Exam::class, 'event_id', 'id');
    }

    public function facilitators()
    {
        return $this->belongsToMany(Facilitator::class, 'event_facilitator', 'event_id', 'facilitator_id')->withTimestamps();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed(); // user_id in events table
    }
}

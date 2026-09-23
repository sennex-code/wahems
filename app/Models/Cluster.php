<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Cluster extends Model

{
    protected $fillable = [
        'event_id',
        'region',
        'province',
        'municipality',
        'barangay',
        'logo',
        'cluster_name',
        'signatory',
        'position',
        'require_signatory'
    ];
    public function Event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }


    public function getLogoAttribute($value): string | null
    {

        if (! $value) {
            return null;
        }
        // Nag rred pag may inteliphesne kaya kinakbit ko to, diko alam     no gainagawa
        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk = Storage::disk('wahems_storage');


        return $disk->temporaryUrl($value, now()->addMinutes(5));
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


    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, "cluster_facility", "cluster_id", "facility_id");
    }

    public function eventParticipants(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }
}

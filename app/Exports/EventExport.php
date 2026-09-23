<?php

namespace App\Exports;

use App\Models\Cluster;
use App\Models\Event;
use App\Models\EventParticipant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EventExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function __construct(private int $eventId) {}

    public function collection()
    {
        $eventParticipant =  EventParticipant::select('id', 'participant_id', 'event_id', 'total_hours_attended', 'facility_name')->with([
            "participant"
        ])->where('event_id', $this->eventId)->get();
        return $eventParticipant;
    }

    public function headings(): array
    {
        return [
            "Participant ID",
            "first_name",
            "middle_initial",
            "last_name",
            "suffix",
            "age",
            "designation",
            "mobile_number",
            "email",
            "gender",
            "total_hours_attended",
            "facility_name",
            "Licensed No.",
            "License Expiry Date",
        ];
    }


public function map($ep): array
{
    $expiry = $ep->participant?->expiry_date;

    return [
        $ep->participant?->id,
        $ep->participant?->first_name,
        $ep->participant?->middle_initial,
        $ep->participant?->last_name,
        $ep->participant?->suffix,
        $ep->participant?->age,
        $ep->participant?->designation,
        $ep->participant?->mobile_number,
        $ep->participant?->email,
        $ep->participant?->gender,
        $ep->total_hours_attended,
        $ep->facility_name,
        $ep->participant?->prc_license,
        $expiry ? Carbon::parse($expiry)->format('d/m/Y') : null,
    ];
}
}

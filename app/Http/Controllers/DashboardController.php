<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Event;
use App\Models\Participant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $currentDate = now()->toDateString();

        $totalEvent = Event::count();

        $upcomingEvent = Event::whereDate('start_at', '>', $currentDate)->count();

        $ongoingEvent = Event::whereDate('start_at', '<=', $currentDate)
            ->whereDate('end_at', '>=', $currentDate)
            ->count();

        $createdEvents = Event::latest()->take(5)->get()->map(function ($event) {
            return [
                "id" => 'Event-created-' . $event->id,
                "type" => "create",
                "message" => 'Event ' . $event->name . ' was created',
                "created_at" => $event->created_at,
                'time' => $event->created_at->diffForHumans(),
            ];
        });


        $updatedEvents = Event::whereColumn('updated_at', '!=', 'created_at')
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($event) {
                return [
                    "id" => "Event-updated-" . $event->id,
                    "type" => "update",
                    "message" => "Event " . $event->name . " was updated",
                    "created_at" => $event->updated_at,
                    'time' => $event->updated_at->diffForHumans(),
                ];
            });

        $registeredParticipants = Participant::latest()
            ->take(5)
            ->get()
            ->map(function ($participant) {
                return [
                    "id" => "Participant-" . $participant->id,
                    'type' => 'register',
                    'message' => $participant->first_name . ' ' . $participant->last_name . ' registered.',
                    "created_at" => $participant->created_at,
                    'time' => $participant->created_at->diffForHumans(),

                ];
            });



        $recentActivites = $createdEvents->concat($updatedEvents)->concat($registeredParticipants)->sortByDesc('created_at')
            ->take(5)->values();


        $totalParticipants = Participant::count();

        $today= today();

    $deployedFacilitators = Event::whereDate('start_at', '<=', today())
    ->whereDate('end_at', '>=', today())
    ->with('facilitators')
    ->take(5)
    ->get()
    ->map(function ($event) {
        return [
            'event_name' => $event->name,
            'event_address' => $event->address,
            'facilitators' => $event->facilitators->pluck('name')->values(),
        ];
    })
    ->values();







$countsPerDesignation = Participant::query()
    ->select('designation')
    ->selectRaw('COUNT(*) as total_count')
    ->selectRaw('SUM(CASE WHEN cpd = 1 THEN 1 ELSE 0 END) as cpd_count')
    ->selectRaw('SUM(CASE WHEN cpd = 0 OR cpd THEN 1 ELSE 0 END) as non_cpd_count')
    ->groupBy('designation')
    ->havingRaw('COUNT(*) > 0') // or > 1 if you only want more than 1 participant
    ->orderBy('designation')
    ->get();
  
  

$cpdCount = Participant::where('cpd', true)->count();
$nonCpdCount = Participant::where('cpd', false)->count();



    
   


        return Inertia::render('dashboard', [
            'countInfo' => [
                'totalEvent' => $totalEvent,
                'upcomingEvent' => $upcomingEvent,
                'ongoingEvent' => $ongoingEvent,
                'totalParticipants' => $totalParticipants,
            ],

            "recentActivities" => $recentActivites,
            "deployedFacilitators" => $deployedFacilitators,
                "participantCountsByDesignation" => $countsPerDesignation,
                "cpdCount" => $cpdCount,
                "nonCpdCount" => $nonCpdCount,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Exports\EventExport;
use App\Models\Attendance;
use App\Models\Cluster;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Facility;
use App\Models\Survey;
use App\Models\FacilitatorSurvey;
use App\Models\FacilitatorQuestionnaire;
use App\Models\FacilitatorQuestionOption;
use App\Models\FacilitatorChoice;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Exam;
use App\Models\ExamBankQuestion;
use Illuminate\Support\Str;
use App\Models\Facilitator;
use App\Models\FacilitatorSurveyAttempt;

class EventController extends Controller
{
    public function index(Request $request)
    {   
        $search = $request->query('search');
        $filterBy = $request->query('filterBy', 'All');
        $statusBy = $request->query('statusBy', 'All');

        $events = Event::select(['id', 'name', 'start_at', 'end_at', 'type', 'facility', 'user_id'])
            ->with([
                'clusters:id,event_id,cluster_name',
                'creator:id,name'
            ])
            ->when($filterBy !== "All", function ($qq) use ($filterBy) {
                $qq->where("type", $filterBy);
            })
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->when($statusBy !== "All", function ($q) use ($statusBy) {
                if ($statusBy === "Upcoming") {
                    $q->whereDate('start_at', '>', today());
                } elseif ($statusBy === "Finished") {
                    $q->whereDate('end_at', '<', today());
                } elseif ($statusBy === "Ongoing") {
                    $q->whereDate('start_at', '<=', today())
                        ->whereDate('end_at', '>=', today());
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Events', [
            'eventsList' => $events,
            "filters" => [
                "search" => $search,
                "filterBy" => $filterBy,
                "statusBy" => $statusBy
            ]
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
    $fields = $request->validate([
        'name' => 'required|string',
        'facility_code' => 'nullable|string',
        'start_at' => 'required|string',
        'end_at' => 'required|string',
        'type' => 'required|string',
        'leader' => 'nullable|string',
        'position' => 'nullable|string',
        'logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'region' => 'required|string',
        'province' => 'required|string',
        'municipality' => 'required|string',
        'address' => 'required|string',
        'required_hours' => 'nullable|integer',

        // facilitators
        'facilitator_ids' => 'nullable|array',
        'facilitator_ids.*' => 'nullable|exists:facilitators,id',

        // clusters
        'clusters' => 'nullable|array',
        'clusters.*.region' => 'required_with:clusters|string',
        'clusters.*.province' => 'required_with:clusters|string',
        'clusters.*.municipality' => 'required_with:clusters|string',
        'clusters.*.logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'clusters.*.cluster_name' => 'required_with:clusters|string',
        'clusters.*.facilities' => 'nullable|array',
        'clusters.*.require_signatory' => 'nullable|boolean',
        'clusters.*.signatory' => 'nullable|string|required_if:clusters.*.require_signatory,1',
        'clusters.*.position' => 'nullable|string|required_if:clusters.*.require_signatory,1',

        // for exams (NOT stored on events table)
        'exam_bank' => 'nullable|string|in:private,lgu,specialized',
    ]);

    return DB::transaction(function () use ($request, $fields) {

        // Extract exam bank (do not store on events)
        $examBank = $fields['exam_bank'] ?? null;
        unset($fields['exam_bank']);

        $examTitlePrefix = match ($examBank) {
            'lgu' => 'WAHtermelon Exam for LGU',
            'specialized' => 'WAHtermelon Exam for E-Claims',
            default => 'WAHtermelon Exam for Private',
        };

        // Handle event logo
        if ($request->hasFile('logo')) {
            $fields['logo'] = $request->file('logo')->store('events-logo', 'wahems_storage');
        }

        $fields['user_id'] = Auth::id();
        $fields['code'] = Str::random(20);

        if (!empty($fields['facility_code'])) {
            $facility = Facility::where('code', $fields['facility_code'])->first();
            if ($facility) {
                $fields['facility'] = $facility->facility_name;
            }
        }

        // Pull out arrays before saving Event
        $clusters = $fields['clusters'] ?? [];
        $facilitatorIds = $fields['facilitator_ids'] ?? [];

        unset($fields['clusters'], $fields['facilitator_ids']);

        // Create event
        $event = Event::create($fields);

        // Attach facilitators ONLY to the event
        if (!empty($facilitatorIds)) {
            $event->facilitators()->sync(array_filter($facilitatorIds));
        }

        // Create exams for Training or Cluster
        if (in_array($event->type, ['Training', 'Cluster'], true) && $examBank) {
            $preExam = Exam::create([
                'event_id' => $event->id,
                'exam_type' => 'pre',
                'bank' => $examBank,
                'title' => $examTitlePrefix . ' Pre Exam',
            ]);

            $postExam = Exam::create([
                'event_id' => $event->id,
                'exam_type' => 'post',
                'bank' => $examBank,
                'title' => $examTitlePrefix . ' Post Exam',
            ]);

            $questionIds = ExamBankQuestion::where('bank', $examBank)
                ->pluck('id')
                ->all();

            $preExam->examQuestionBank()->sync($questionIds);
            $postExam->examQuestionBank()->sync($questionIds);
        }

        // Cluster logic
        if ($event->type === 'Cluster' && !empty($clusters)) {
            foreach ($clusters as $clusterData) {
                $clusterToSave = $clusterData;

                $facilityIds = $clusterToSave['facilities'] ?? [];
                unset($clusterToSave['facilities']);

                if (
                    isset($clusterToSave['logo']) &&
                    $clusterToSave['logo'] instanceof \Illuminate\Http\UploadedFile
                ) {
                    $clusterToSave['logo'] = $clusterToSave['logo']->store('cluster-logo', 'wahems_storage');
                }

                $cluster = $event->clusters()->create($clusterToSave);

                if (!empty($facilityIds)) {
                    $cluster->facilities()->sync($facilityIds);
                }
            }
        }

        // Survey for Cluster or Training
        if (in_array($event->type, ['Cluster', 'Training'], true)) {
            Survey::create([
                'event_id' => $event->id,
                'title' => $event->name,
            ]);
        }

        // Create facilitator surveys for the event
        $this->createFacilitatorSurveysForEvent($event, $facilitatorIds);

        return back();
    });
}

    /**
     * Create facilitator surveys for all facilitators assigned to an event
     * and attach all questions with their choices
     */
    private function createFacilitatorSurveysForEvent($event, $facilitatorIds)
    {
        // If no facilitators provided, do nothing
        if (empty($facilitatorIds)) {
            return;
        }

        // Get all questionnaires and choices once (not per facilitator)
        $questionnaires = FacilitatorQuestionnaire::all();
        $choices = FacilitatorChoice::orderBy('choice_value')->get();

        // Mount choices to questionnaires once (not per facilitator)
        foreach ($questionnaires as $questionnaire) {
            // Only attach choices for rating type questions
            if ($questionnaire->question_type === 'rating') {
                foreach ($choices as $choice) {
                    FacilitatorQuestionOption::firstOrCreate([
                        'questionnaire_id' => $questionnaire->id,
                        'choice_id' => $choice->id,
                    ]);
                }
            }
        }

        // Create a survey for each facilitator
        foreach ($facilitatorIds as $facilitatorId) {
            $survey = FacilitatorSurvey::create([
                'facilitator_id' => $facilitatorId,
                'event_id' => $event->id,
                'name' => 'Facilitator Evaluation - ' . $event->name,
            ]);

            // Attach all questionnaire questions to this survey
            $questionnaireIds = $questionnaires->pluck('id')->toArray();
            $survey->questions()->sync($questionnaireIds);
        }
    }

    public function toggleRegistration(Event $event, Request $request)
    {
        $event->update([
            "is_registration_active" => $request->boolean('is_registration_active')
        ]);
        return back();
    }

public function update(Request $request, $eventId)
{
    $event = Event::with('eventParticipants.attendances')->findOrFail($eventId);

    $oldStartDate = $event->start_at;
    $oldEndDate = $event->end_at;

    // 1. Validation
    $fields = $request->validate([
        'name' => 'required|string',
        'facility_code' => 'nullable|string',
        'start_at' => 'required|string',
        'end_at' => 'required|string',
        'type' => 'required|string',
        'leader' => 'nullable|string',
        'position' => 'nullable|string',
        'logo' => 'nullable',
        'region' => 'string|required',
        'province' => 'string|required',
        'municipality' => 'string|required',
        'address' => 'string|required',
        'required_hours' => 'nullable|integer',
        'clusters' => 'nullable|array',
        'clusters.*.region' => 'string|required_with:clusters',
        'clusters.*.province' => 'string|required_with:clusters',
        'clusters.*.municipality' => 'string|required_with:clusters',
        'clusters.*.cluster_name' => 'string|required_with:clusters',
        'clusters.*.id' => 'nullable|integer|exists:clusters,id',
        'clusters.*.facilities' => 'array|nullable|required_with:clusters',
        'clusters.*.require_signatory' => ['required', 'boolean'],
        'clusters.*.signatory' => 'nullable|string|required_if:clusters.*.require_signatory,1',
        'clusters.*.position' => 'nullable|string|required_if:clusters.*.require_signatory,1',
    ]);

    $validatedFacilitators = $request->validate([
        'facilitator_ids' => 'nullable|array',
        'facilitator_ids.*' => 'integer|exists:facilitators,id',
    ]);
    $facilitatorIds = $validatedFacilitators['facilitator_ids'] ?? [];

    $examBank = $request->validate([
        'exam_bank' => 'required|string|in:private,lgu,specialized',
    ])['exam_bank'];

    // 2. Database Transaction
    DB::transaction(function () use ($event, $oldStartDate, $oldEndDate, $fields, $examBank, $request, $facilitatorIds) {
        
        // --- Handle Exam Sync ---
        $exams = Exam::where('event_id', $event->id)->get();
        foreach ($exams as $e) {
            $e->title = strtoupper($examBank) . ($e->exam_type === 'pre' ? " Pre Exam" : " Post Exam");
            $e->bank = $examBank;
            $e->save();

            $questionIds = ExamBankQuestion::where('bank', $examBank)->pluck('id')->all();
            $e->examQuestionBank()->sync($questionIds);
        }

        // --- Handle Date Updates ---
        $newStartDate = $fields['start_at'];
        $newEndDate = $fields['end_at'];
        if ($oldStartDate !== $newStartDate || $oldEndDate !== $newEndDate) {
            foreach ($event->eventParticipants as $participant) {
                $this->updateDates($participant, $newStartDate, $newEndDate);
            }
        }

        // --- Handle Facility Update ---
        if (!empty($fields['facility_code'])) {
            $facility = Facility::where('code', $fields['facility_code'])->select('facility_name')->first();
            $fields['facility'] = $facility?->facility_name;
            EventParticipant::where('event_id', $event->id)->update(['facility_name' => $fields['facility']]);
        }

        // --- Handle Logo ---
        if ($request->hasFile('logo')) {
            $fields['logo'] = $request->file('logo')->store('events-logo', 'wahems_storage');
        } else {
            unset($fields['logo']);
        }

        // --- Handle Clusters ---
        if (($fields['type'] ?? null) === 'Cluster') {
            $existingClustersIds = $event->clusters()->pluck('id')->toArray();
            $submittedClusterIds = collect($fields['clusters'] ?? [])->filter(fn($c) => isset($c['id']))->map(fn($c) => $c['id'])->all();
            $toBeDeleted = array_diff($existingClustersIds, $submittedClusterIds);

            foreach ($toBeDeleted as $clusterId) {
                if (!EventParticipant::where('event_id', $event->id)->where('cluster_id', $clusterId)->exists()) {
                    $cluster = Cluster::find($clusterId);
                    if ($cluster) {
                        $cluster->facilities()->detach();
                        $cluster->delete();
                    }
                }
            }

            foreach (($fields['clusters'] ?? []) as $clusterData) {
                $cluster = !empty($clusterData['id']) 
                    ? Cluster::where('event_id', $event->id)->findOrFail($clusterData['id']) 
                    : new Cluster(['event_id' => $event->id]);

                $clusterFields = $clusterData;
                unset($clusterFields['id'], $clusterFields['facilities']);

                if ($request->hasFile("clusters.{$clusterData['id']}.logo")) {
                    $clusterFields['logo'] = $request->file("clusters.{$clusterData['id']}.logo")->store('cluster-logo', 'wahems_storage');
                } elseif (isset($clusterFields['logo']) && filter_var($clusterFields['logo'], FILTER_VALIDATE_URL)) {
                    unset($clusterFields['logo']);
                }

                $cluster->fill($clusterFields);
                $cluster->save();

                if (isset($clusterData['facilities'])) {
                    $facilityIds = collect($clusterData['facilities'])->map(fn($f) => is_array($f) ? ($f['id'] ?? $f) : $f)->filter()->all();
                    $cluster->facilities()->sync($facilityIds);
                }
            }
        }

        // --- Save Event Changes ---
        unset($fields['clusters']);
        $event->fill($fields);
        if ($event->isDirty()) { $event->save(); }

        // --- Sync Facilitators (Pivot Table) ---
        $event->facilitators()->sync($facilitatorIds);

        // --- SYNC FACILITATOR SURVEYS & QUESTIONS ---
        if (!empty($facilitatorIds)) {
            // 1. Cleanup: Remove surveys for facilitators no longer assigned (if no one has answered yet)
            $existingSurveys = FacilitatorSurvey::where('event_id', $event->id)->get();
            foreach ($existingSurveys as $survey) {
                if (!in_array($survey->facilitator_id, $facilitatorIds)) {
                    $hasAttempts = FacilitatorSurveyAttempt::where('survey_id', $survey->id)->exists();
                    if (!$hasAttempts) {
                        $survey->questions()->detach(); // Clean up pivot before deleting survey
                        $survey->delete();
                    }
                }
            }

            // 2. Create/Update: Ensure questions are attached
            // Fetch all Master Questionnaire IDs once to save memory
            $masterQuestionIds = FacilitatorQuestionnaire::pluck('id')->toArray();

            foreach ($facilitatorIds as $facilitatorId) {
                $facilitator = Facilitator::find($facilitatorId);
                if (!$facilitator) continue;

                $survey = FacilitatorSurvey::firstOrCreate(
                    ['event_id' => $event->id, 'facilitator_id' => $facilitatorId],
                    [
                        'facilitator_name' => $facilitator->name,
                        'name' => 'Facilitator Evaluation - ' . $event->name,
                        'is_active' => true,
                    ]
                );

                // CRITICAL FIX: Sync questions to the survey so they mount in the UI
                // This populates the facilitator_survey_questions table
                $survey->questions()->sync($masterQuestionIds);
            }
        }
    });

    return redirect()->back()->with('success', 'Event updated successfully.');
}

    public function destroy($eventId)
    {
        $event = Event::with('clusters.facilities')->findOrFail($eventId);
        $disk = Storage::disk('wahems_storage');

        if ($event->type === "Cluster") {
            foreach ($event->clusters as $cluster) {
                if ($cluster->logo && $disk->exists($cluster->logo)) {
                    $disk->delete($cluster->logo);
                }
                $cluster->facilities()->detach();
            }
        }

        if ($event->logo && $disk->exists($event->logo)) {
            $disk->delete($event->logo);
        }

        $event->delete();

        return redirect('/events')->with('success', 'Event deleted successfully');
    }

    public function updateDates($eventParticipant, $newStartAt, $newEndAt)
    {
        $newStartDate = Carbon::parse($newStartAt);
        $newEndDate = Carbon::parse($newEndAt);

        // Delete corresponding attendances outside the date range
        $eventParticipant->attendances()
            ->where(function ($query) use ($newStartDate, $newEndDate) {
                $query->where('date_on', '<', $newStartDate)
                    ->orWhere('date_on', '>', $newEndDate);
            })
            ->delete();

        $existingAttendances = $eventParticipant->attendances()
            ->whereBetween('date_on', [$newStartDate, $newEndDate])
            ->get();

        while ($newStartDate <= $newEndDate) {
            $existingAttendance = $eventParticipant->attendances()
                ->where('date_on', $newStartDate)
                ->first();

            if (!$existingAttendance) {
                $attendance = Attendance::create([
                    'event_participants_id' => $eventParticipant->id,
                    'date_on' => $newStartDate,
                    'hasAttended' => 0,
                    'hours_attended' => 0,
                ]);
            }

            // Add one day to the newStartDate variable
            $newStartDate->addDay();
        }
    }

    public function export($eventId)
    {
        $event = Event::select('name')->findOrFail($eventId);
        return Excel::download(new EventExport((int) $eventId), $event->name . '.xlsx');
    }

    public function show(Request $request, $eventId)
    {
        $search = $request->query('search');
        $event = Event::with([
            'eventParticipants',
            'clusters.facilities',
            'exams',
            'facilitators'
        ])->findOrFail($eventId);



        $hasExam = Exam::where('event_id', $eventId)->exists();
        $exams = Exam::where('event_id', $eventId)->get();

        $eventParticipants = $event->eventParticipants()
            ->with(['participant', 'attendances'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('participant', function ($query) use ($search) {
                    $query->where(function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            })
            ->orderByDesc('created_at')
            ->paginate(5)
            ->withQueryString();
       

            $today = Carbon::today()->format('Y-m-d');

$eventParticipantsAttendance = $event->eventParticipants()
    ->with(['attendances' => function ($q) use ($today) {
        $q->where('date_on', $today);
    }])->get();

$areAllPresent = $eventParticipantsAttendance->every(function ($ep) {
    // If NO attendance for today, treat as not present.
    return $ep->attendances->count() > 0
        && $ep->attendances->every(function ($a) {
            return (bool) ($a->has_attended ?? $a->hasAttended);
        });
});


      
        $eventArray = $event->toArray();
        $eventArray['logo'] = $event->logo();

        if ($event->type === "Cluster") {
            $eventArray['clusters'] = $event->clusters->map(function ($cluster) {
                $clusterArray = $cluster->toArray();

                if ($cluster->logo) {
                    if (Str::startsWith($cluster->logo, ['http://', 'https://'])) {
                        $clusterArray['logo'] = $cluster->logo;
                    } else {
                        $disk = Storage::disk('wahems_storage');
                        $clusterArray['logo'] = $disk->url($cluster->logo);
                    }
                } else {
                    $clusterArray['logo'] = null;
                }

                return $clusterArray;
            })->values()->all();
        }

        

        return Inertia::render("SpecificEvents", [
            "event" => $eventArray,
            "filters" => [
                "search" => $search,
            ],
            "eventParticipants" => $eventParticipants,
            "hasExam" => $hasExam,
            "exams" => $exams,
            "areAllPresent" => $areAllPresent,
        ]);
    }
}
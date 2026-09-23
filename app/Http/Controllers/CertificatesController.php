<?php

namespace App\Http\Controllers;

use App\Mail\MedTechCertificateMail;
use App\Models\Barangay;
use App\Models\Cluster;
use App\Models\ClustersFacility;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Facility;
use App\Models\Municipality;
use App\Models\Participant;
use App\Models\Province;
use App\Models\Region;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;


class CertificatesController extends Controller
{
public function index(Request $request)
{
    $today = now();
    $search = trim((string) $request->query('search', ''));

    $events = Event::with([
            'eventParticipants',
            'eventRegion',
            'eventProvince',
            'eventMunicipality',
            'eventBarangay',
            // Clusters with logo
            'clusters' => fn ($q) => $q->select(['id', 'event_id', 'cluster_name', 'logo']),
            // Each cluster's facilities
            'clusters.facilities' => fn ($q) => $q->select(['id', 'cluster_id', 'facility_name']),
        ])
        ->when($search !== '', function ($q) use ($search) {
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        })
        ->orderBy('end_at', 'desc')
        ->paginate(10)
        ->withQueryString();

    return Inertia::render("Certificates", [
        "events" => $events,
        "filters" => [
            "search" => $search,
        ],
    ]);
}

    // The reason it "can’t add" / doesn’t show is because you only set
    // $participant->total_hours_attended inside the `else` of:
    // if ($participant->pivot && $participant->pivot->cluster_id)
    //
    // So for Cluster participants (the common case), you never assign it.
    //
    // Fix: compute/attach total_hours_attended for EVERY participant first,
    // then do your cluster-specific enrichment.

    public function getParticipants($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);
            $eventFacID = $event->facilityCode->id ?? null;
           

            $event->load('participants');

           $howManyCPD= $event->participants()->where('cpd', true)->count();
            $doesHaveCPD = $howManyCPD > 0;

            if($event->type === 'Cluster') {
                $event->load('clusters');
            }
           

            $mappedParticipants = $event->participants->map(function ($participant) use ($eventId, $event) {
               
                    if($event->type === 'Cluster'){
                         $eventParticipant = EventParticipant::with(['cluster'])->where('participant_id', $participant->id)
                            ->where('event_id', $eventId)
                            ->first();
                    }else{
                         $eventParticipant = EventParticipant::where('participant_id', $participant->id)
                    ->where('event_id', $eventId)
                    ->first();
                    }

                $cluster = null;
                $clusterLogo = null;
                $clusterLogoBase64 = null;

                if ($event->type === 'Cluster' && $eventParticipant?->cluster_id) {
                    $cluster = Cluster::find($eventParticipant->cluster_id);
                 
                    if ($cluster) {
                        $clusterLogo = $cluster->logo();
                        $clusterLogoBase64 = $cluster->getLogoBase64Attribute();
                    }
                }

                return [
                    ...$participant->toArray(),
                    'total_hours_attended' => $eventParticipant?->total_hours_attended ?? 0,
                    'cluster' => $cluster ? [
                        ...$cluster->toArray(),
                        'logo_url' => $clusterLogo,
                        'logo_base64' => $clusterLogoBase64,
                    ] : null,
                    'cluster_logo' => $clusterLogo,
                    'cluster_logo_base64' => $clusterLogoBase64,
                ];
            });

            return response()->json([
                ...$event->toArray(),
                'facility_id' => $event->type !== 'Cluster' ? $eventFacID : null,
                'logo' => $event->type !== 'Cluster' ? $event->logo() : null    ,
                'logoBase64' => $event->type !== 'Cluster'
                    ? $event->getLogoBase64Attribute()
                    : null,
                'participants' => $mappedParticipants,
                'doesHaveCPD' => $doesHaveCPD,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function showMedTechCertificate($participantId, $event_id, Request $request)
    {
        $event = Event::findOrFail($event_id);

        $accreditationCode = $request->query('accred_code', '');

        $fac_id = Facility::where('code', $event->facility_code)->first()->id ?? null;

        $topicsJson = $request->query('topics');
        $selectedTopics = $topicsJson ? json_decode(urldecode($topicsJson), true) : [];

        $includeWAHSignatories = $request->query('include_wah_signatories') === 'true';
        $download = $request->query('download') === 'true';
          $index= $request->query('index');


        // Link logo
        $logotmp = Event::where('id', $event_id)->first();

        $logo = $logotmp->logo() ?? null;
        $logoBase64  = $logotmp->getLogoBase64Attribute();


        if ($event->type == 'Cluster') {
            $event_participant = EventParticipant::where('participant_id', $participantId)
                ->where('event_id', $event_id)
                ->first();

            $cluster_id = $event_participant->cluster_id ?? null;
            $cluster= Cluster::where('id', $cluster_id)->first();
            $logotmpCluster = Cluster::where('id', $cluster_id)->first();
            $logo = $logotmpCluster->logo() ?? null;
       
            $logoBase64  = $logotmpCluster->getLogoBase64Attribute();
            $facility_name = $event_participant->facility_name ?? 'Unknown Facility';
         

            $isSignatoryRequired = $cluster->require_signatory == true;

            if($isSignatoryRequired){
                $signatories = Cluster::where('id', $cluster_id)->first()->signatory ?? null;
                $position= Cluster::where('id', $cluster_id)->first()->position ?? null;
            } else {
                $signatories = $event->signatory ?? null;
                $position = $event->position ?? null;
            }

          
            

            $cluster_facility_id = ClustersFacility::where('cluster_id', $event_participant->cluster_id)
                ->get()
                ->pluck('facility_id')
                ->toArray();

            foreach ($cluster_facility_id as $facility_id) {
                $facName = Facility::where('id', $facility_id)->first()->facility_name ?? 'Unknown Facility';
                if ($facName === $facility_name) {
                    $fac_id = $facility_id;
                    break;
                }
            }
        }


        $isCPD = Participant::where('id', $participantId)->where('cpd', true)->exists();
        $cpdCode = $request->query('cpd_code', '');

        $hoursAttended = EventParticipant::where('participant_id', $participantId)
            ->where('event_id', $event_id)
            ->first()
            ->total_hours_attended ?? 0;

        $totalHours = $event->required_hours ?? 0;



        $isCompleted = $hoursAttended >= $totalHours;

        $participant = Participant::with(['events' => function ($query) use ($event_id) {
            $query->where('events.id', $event_id);
        }, 'events.facilityCode'])
            ->findOrFail($participantId);

        $eventData = $participant->events->first();

        if (!$eventData) {
            return back()->with('error', 'Participant is not registered for this specific event.');
        }

        $region = Region::where('psgc_10_digit_code', $eventData->region)->first()->name ?? 'Unknown Region';
        $province = Province::where('psgc_10_digit_code', $eventData->province)->first()->name ?? 'Unknown Province';
        $municipality = Municipality::where('psgc_10_digit_code', $eventData->municipality)->first()->name ?? 'Unknown Municipality';
        $barangay = Barangay::where('psgc_10_digit_code', $eventData->barangay)->first()->name ?? 'Unknown Barangay';
    

        $payload = [
            'data' => $participant,
            'eventData' => $eventData,
            'region' => $region,
            'province' => $province,
            'municipality' => $municipality,
            'barangay' => $barangay,
            'isCPD' => $isCPD,
            'cpdCode' => $cpdCode,
            'totalHours' => $totalHours,
            'participantHoursAttended' => $hoursAttended,
            'isCompleted' => $isCompleted,
            'index' => $index,
            'selectedTopics' => $selectedTopics,
            'accreditationCode' => $accreditationCode,
            'includeWAHSignatories' => $includeWAHSignatories,
            'download' => $download,
            'logo' => $logo,
            "logoBase64" => $logoBase64,
            'signatories' => $signatories ?? $event->leader,
            'position' => $position ?? $event->position,
            
        ];


      

        // --- PDF DOWNLOAD LOGIC (Browsershot::html) ---

        
        // --- PREVIEW (INERTIA) LOGIC ---cert
        return Inertia::render('certificateTemps/medTechCert', $payload);
    }

    /**
     * OLD (can keep as fallback): Generates PDF by visiting the certificate URL via headless Chrome.
     * This is slower and can time out on Inertia pages.
     */
   public function emailMedTechCertificate(Request $request)
{
    $validated = $request->validate([
        'participant_id' => ['required', 'integer'],
        'event_id' => ['required', 'integer'],
        'index' => ['required', 'integer'], // <-- Add this line!
        'cpd' => ['required', 'boolean'],
        'cpd_code' => ['nullable', 'string'],
        'topics' => ['nullable', 'array'],
        'topics.*' => ['string'],
        'accred_code' => ['nullable', 'string'],
        'include_wah_signatories' => ['nullable', 'boolean'],
    ]);

    $participantId = (int) $validated['participant_id'];
    $eventId = (int) $validated['event_id'];
    $index = (int) $validated['index']; // <-- Get index

    $isCPD = (bool) $validated['cpd'];
    $cpdCode = (string) ($validated['cpd_code'] ?? '0');
    $selectedTopics = $validated['topics'] ?? [];
    $accreditationCode = (string) ($validated['accred_code'] ?? '');
    $includeWAHSignatories = (bool) ($validated['include_wah_signatories'] ?? false);

    $participant = Participant::findOrFail($participantId);
    $to = $participant->email ?? null;

    if (!$to) {
        return response()->json([
            'message' => 'Participant has no email address on record.',
        ], 422);
    }

    // Helps node resolve local puppeteer
    putenv('NODE_PATH=' . base_path('node_modules'));

    $url = url("/certificates/{$participantId}/{$eventId}") . '?' . http_build_query([
        'cpd' => $isCPD ? 'true' : 'false',
        'cpd_code' => $cpdCode,
        'topics' => json_encode($selectedTopics),
        'accred_code' => $accreditationCode,
        'include_wah_signatories' => $includeWAHSignatories ? 'true' : 'false',
        'download' => 'false',
        'index' => $index, // <-- Pass index to the certificate route!
    ]);

    $node = 'C:\\Program Files\\nodejs\\node.exe';
    $chrome = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

    $readySelector = '#certificate-root';

    try {
        set_time_limit(300);

        $pdfBinary = Browsershot::url($url)
            ->setNodeBinary($node)
            ->setChromePath($chrome)
            ->setOption('args', [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ])
            ->showBackground()
            ->format('Legal')
            ->landscape(false)
            ->timeout(300)
            ->setDelay(1000)
            ->waitForFunction("document.querySelector(" . json_encode($readySelector) . ") !== null")
            ->pdf();

        $filename = "Certificate_{$participantId}_" . \Str::slug($participant->last_name ?? 'participant') . ".pdf";
        $event = Event::findOrFail($eventId);

        \Mail::to($to)->send(new MedTechCertificateMail(
            participant: $participant,
            event: $event,
            pdfBinary: $pdfBinary,
            filename: $filename
        ));

        return response()->json([
            'message' => 'Email sent successfully.',
        ]);
    } catch (\Throwable $e) {
        \Log::error('emailMedTechCertificate failed', [
            'error' => $e->getMessage(),
            'url_used' => $url,
            'node' => $node,
            'chrome' => $chrome,
        ]);

        return response()->json([
            'message' => $e->getMessage(),
            'error' => $e->getMessage(),
            'url_used' => $url,
            'node' => $node,
            'chrome' => $chrome,
        ], 500);
    }
}

    /**
     * NEW (recommended): Accepts an uploaded PDF generated in the browser (React-PDF)
     * and emails it to the participant. No Browsershot needed => avoids timeouts.
     *
     * POST /certificates/email-upload (multipart/form-data)
     * Fields:
     * - participant_id (int)
     * - event_id (int)
     * - certificate_pdf (file, pdf)
     */
    public function emailMedTechCertificateUpload(Request $request)
    {
        set_time_limit(120);

        $validated = $request->validate([
            'participant_id' => ['required', 'integer'],
            'event_id' => ['required', 'integer'],
            'certificate_pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'], // 20MB
        ]);

        $participantId = (int) $validated['participant_id'];
        $eventId = (int) $validated['event_id'];

        $participant = Participant::findOrFail($participantId);
        $event = Event::findOrFail($eventId);

        $to = $participant->email ?? null;
        if (!$to) {
            return response()->json([
                'message' => 'Participant has no email address on record.',
            ], 422);
        }

        $pdfFile = $request->file('certificate_pdf');

        if (!$pdfFile || !$pdfFile->isValid()) {
            return response()->json([
                'message' => 'Uploaded PDF is missing or invalid.',
            ], 422);
        }

        $pdfBinary = file_get_contents($pdfFile->getRealPath());
        $filename = $pdfFile->getClientOriginalName() ?: "Certificate_{$participantId}.pdf";

        Mail::to($to)->send(new MedTechCertificateMail(
            participant: $participant,
            event: $event,
            pdfBinary: $pdfBinary,
            filename: $filename
        ));

        return response()->json([
            'message' => 'Email sent successfully.',
        ]);
    }
}

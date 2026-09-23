<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Activity;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityParticipant;
use App\Services\GoogleService;
use Google\Service\Calendar\Event;
use Carbon\Carbon;

class ActivitiesController extends Controller
{




  public function index()
{
    $activities = Activity::with('participants')->get()->map(function ($activity) {
        return [
            'id' => $activity->id,
            'event_name' => $activity->event_name,
            'organizer_email' => $activity->organizer_email,
            'start_time' => $activity->start_time,
            'end_time' => $activity->end_time,
            'start_date' => $activity->start_date,
            'end_date' => $activity->end_date,
            'status' => $activity->status,
            'created_at' => $activity->created_at,
            'google_event_id' => $activity->google_event_id,
            'participants' => $activity->participants->map(function ($p) {
                return [
                    'name' => $p->participant_name,
                    'email' => $p->participant_email,
                ];
            }),
        ];
    });

    return Inertia::render('CalendarOfActivities', [
        'activitiess' => $activities,
    ]);
}

public function searchUsers(Request $request)
{
    $term = $request->query('term');

    $results = DB::table('activity_users')
        ->where('name', 'LIKE', '%' . $term . '%')
        ->orWhere('email', 'LIKE', '%' . $term . '%')
        ->get(['name', 'email']);

    return response()->json($results);
}

public function store(Request $request): \Illuminate\Http\JsonResponse
{
   $validated = $request->validate([
        'event' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'start_time' => 'nullable|date_format:H:i', 
        'end_time' => 'nullable|date_format:H:i',
        'startDate' => 'required|date',
        'endDate' => 'required|date|after_or_equal:startDate',
        'status' => 'required|string|in:Sure,Not Sure,Cancelled',
        'participants' => 'required|array|min:1',
        'participants.*.name' => 'required|string|max:255',
        'participants.*.email' => 'required|string|email|max:255',
    ]);

    DB::beginTransaction();

    try {
        $activity = Activity::create([
            'event_name' => $validated['event'],
            'organizer_email' => $validated['email'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'status' => $validated['status'],
            'user_id' => auth()->id(),
        ]);

        foreach ($validated['participants'] as $p) {
            ActivityParticipant::create([
                'activity_id' => $activity->id,
                'participant_name' => $p['name'],
                'participant_email' => $p['email'],
            ]);
        }

        $googleService = new GoogleService();
        $participantNames = collect($validated['participants'])
            ->map(fn($p) => "- {$p['name']} ({$p['email']})")
            ->implode("\n");

        try {
    $calendar = $googleService->calendar();
    $calendarId = 'c_b6cdbe39e1e0c8a8ae12f63c5a0a83676770048dab630bf1ab25b8207bf2f672@group.calendar.google.com';
    


   $staticEmails = ['healthpartners@wah.ph', 'wah.pilipinas@gmail.com'];

$attendees = collect($validated['participants'])->map(function($p) use ($validated, $staticEmails) {
    $emails = [
        ['email' => $p['email']],         // participant
        ['email' => $validated['email']], // organizer
    ];

    // Add all static emails
    foreach ($staticEmails as $static) {
        $emails[] = ['email' => $static];
    }

    return $emails;
})->flatten(1)->unique('email')->values()->toArray(); // flatten and remove duplicates

// 1. Declare the local timezone context explicitly
$manilaTimezone = new \DateTimeZone('Asia/Manila');

if (!empty($validated['start_time']) && !empty($validated['end_time'])) {
    // 2. Pass the timezone instance as the second argument here
    $start = new \DateTime($validated['startDate'] . ' ' . $validated['start_time'], $manilaTimezone);
    $end = new \DateTime($validated['endDate'] . ' ' . $validated['end_time'], $manilaTimezone);

    $event = new \Google\Service\Calendar\Event([
        'summary' => $validated['event'],
        'description' => "Participants:\n" . $participantNames,
        // .format(RFC3339) will now output accurate timestamps ending in +08:00
        'start' => ['dateTime' => $start->format(\DateTime::RFC3339), 'timeZone' => 'Asia/Manila'],
        'end' => ['dateTime' => $end->format(\DateTime::RFC3339), 'timeZone' => 'Asia/Manila'],
        'attendees' => $attendees,
    ]);
} else {
    $start = new \DateTime($validated['startDate'], $manilaTimezone);
    $end = new \DateTime($validated['endDate'], $manilaTimezone);
    $end->modify('+1 day');

    $event = new \Google\Service\Calendar\Event([
        'summary' => $validated['event'],
        'description' => "Participants:\n" . $participantNames,
        'start' => ['date' => $start->format('Y-m-d')],
        'end' => ['date' => $end->format('Y-m-d')],
        'attendees' => $attendees,
    ]);
}
    $createdEvent = $calendar->events->insert($calendarId, $event, ['sendUpdates' => 'all']);
    
    $activity->google_event_id = $createdEvent->id;
    $activity->save();
} catch (\Throwable $googleError) {
    Log::error('Google Calendar error: ' . $googleError->getMessage());
}

     try {
    $sheetService = $googleService->sheets();
    $spreadsheetId = '1qfC2MhygDsTM9t1bsWnnSwOZQQ3OEztcn-x5qCFOPhE';
    $sheetName = 'calendarOfActivities';

    $headerRange = "{$sheetName}!A1:Z1";
    $headerResponse = $sheetService->spreadsheets_values->get($spreadsheetId, $headerRange);
    $headers = $headerResponse->getValues()[0] ?? [];

    $startDate = \Carbon\Carbon::parse($validated['startDate'])->startOfWeek(\Carbon\Carbon::MONDAY);
    $searchFull = $startDate->format('F j'); 
    $searchShort = $startDate->format('M j'); 

    $columnIndex = -1;
    foreach ($headers as $index => $headerValue) {
        if (stripos($headerValue, $searchFull) !== false || stripos($headerValue, $searchShort) !== false) {
            $columnIndex = $index;
            break;
        }
    }

    if ($columnIndex === -1) {
        throw new \Exception("No matching week span found for " . $searchFull);
    }

    $columnLetter = $this->getNameFromNumber($columnIndex);

    $colResponse = $sheetService->spreadsheets_values->get($spreadsheetId, "{$sheetName}!{$columnLetter}:{$columnLetter}");
    $existingRows = $colResponse->getValues() ?? [];
    
    $rowCount = count($existingRows);
    $targetRow = ($rowCount < 2) ? 2 : (floor($rowCount / 2) * 2) + 2;

    $range = "{$sheetName}!{$columnLetter}{$targetRow}";
    
    // Add the same time formatting logic you used in addToSheets
    $timeText = 'No time specified';
    if (!empty($validated['start_time']) && !empty($validated['end_time'])) {
        $timeText = date('g:i A', strtotime($validated['start_time'])) . ' - ' . date('g:i A', strtotime($validated['end_time']));
    }

    $values = [
        [$validated['event']],     
        ["Time: " . $timeText . "\n\n" . $participantNames]         
    ];

    $body = new \Google_Service_Sheets_ValueRange(['values' => $values]);
    $params = ['valueInputOption' => 'USER_ENTERED'];
    $sheetService->spreadsheets_values->update($spreadsheetId, $range, $body, $params);


   $colorMap = [
    'sure'      => ['red' => 0.0, 'green' => 0.48, 'blue' => 0.95], 
    'not sure'  => ['red' => 1.0, 'green' => 0.65, 'blue' => 0.0],   
    'cancelled' => ['red' => 0.9, 'green' => 0.1, 'blue' => 0.1],   
];

    $statusKey = strtolower($validated['status'] ?? '');
    $bgColor = $colorMap[$statusKey] ?? ['red' => 1, 'green' => 1, 'blue' => 1]; 

    $spreadsheet = $sheetService->spreadsheets->get($spreadsheetId);
    $targetSheetId = 0;
    foreach ($spreadsheet->getSheets() as $s) {
        if ($s->getProperties()->getTitle() == $sheetName) {
            $targetSheetId = $s->getProperties()->getSheetId();
            break;
        }
    }

    $requests = [
    new \Google_Service_Sheets_Request([
        'repeatCell' => [
            'range' => [
                'sheetId' => $targetSheetId,
                'startRowIndex' => $targetRow - 1,
                'endRowIndex' => $targetRow + 1,
                'startColumnIndex' => $columnIndex,
                'endColumnIndex' => $columnIndex + 1,
            ],
            'cell' => [
                'userEnteredFormat' => [
                    'backgroundColor' => $bgColor,
                    'horizontalAlignment' => 'CENTER',
                    'verticalAlignment' => 'MIDDLE',
                    'wrapStrategy' => 'WRAP',
                    'textFormat' => [
                        'bold' => true,
                        'foregroundColor' => [
                            'red' => 1.0,
                            'green' => 1.0,
                            'blue' => 1.0,
                        ],
                    ],
                ],
            ],
            'fields' => 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
        ],
    ]),
];

    $batchUpdateRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest(['requests' => $requests]);
    $sheetService->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);

} 
 catch (\Throwable $sheetError) {
    return response()->json([
        'success' => false, 
        'message' => 'Sheets Debug: ' . $sheetError->getMessage()
    ], 500);
}

        DB::commit();

        return response()->json([
            'success' => true,
            'activity' => $activity
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Activity save error: ' . $e->getMessage(), ['stack' => $e->getTraceAsString()]);
        return response()->json(['success' => false, 'message' => 'Failed to save activity.'], 500);
    }

}
private function getNameFromNumber($num) {
    $numeric = $num % 26;
    $letter = chr(65 + $numeric);
    $num2 = intval($num / 26);
    if ($num2 > 0) {
        return $this->getNameFromNumber($num2 - 1) . $letter;
    } else {
        return $letter;
    }
}

public function destroy($id)
{
    try {
        $activity = Activity::findOrFail($id);
        $googleService = new GoogleService();

        // --- 1. Delete from Google Calendar ---
        if ($activity->google_event_id) {
            try {
                $calendar = $googleService->calendar();
                // Use the specific Calendar ID from your store method
                $calendarId = 'c_b6cdbe39e1e0c8a8ae12f63c5a0a83676770048dab630bf1ab25b8207bf2f672@group.calendar.google.com';
                $calendar->events->delete($calendarId, $activity->google_event_id);
            } catch (\Exception $e) {
                Log::error("Google Calendar Delete Failed: " . $e->getMessage());
            }
        }

        // --- 2. Delete from Google Sheets ---
        try {
            $this->removeFromSheets($activity->event_name);
        } catch (\Exception $e) {
            Log::error("Google Sheets Delete Failed: " . $e->getMessage());
        }

        // --- 3. Delete from Database ---
        // Participants will be deleted automatically if cascade is on, 
        // otherwise: ActivityParticipant::where('activity_id', $id)->delete();
        $activity->delete();

        return response()->json(['success' => true, 'message' => 'Activity deleted successfully']);

    } catch (\Exception $e) {
        Log::error("Deletion failed: " . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Internal Server Error'], 500);
    }
}

/**
 * Helper to find and clear the event from the sheet
 */
private function removeFromSheets($eventName)
{
    $googleService = new GoogleService();
    $sheetService = $googleService->sheets();
    $spreadsheetId = '1qfC2MhygDsTM9t1bsWnnSwOZQQ3OEztcn-x5qCFOPhE';
    $sheetName = 'calendarOfActivities';

    // Fetch the entire sheet to find the text
    $response = $sheetService->spreadsheets_values->get($spreadsheetId, "{$sheetName}!A:Z");
    $rows = $response->getValues();

    if (!$rows) return;

    foreach ($rows as $rowIndex => $row) {
        foreach ($row as $colIndex => $cellValue) {
            if (trim($cellValue) === trim($eventName)) {
                $colLetter = $this->getNameFromNumber($colIndex);
                $rowNumber = $rowIndex + 1;
                
                // Clear the Event Title and the Participant list (the cell below it)
                $range = "{$sheetName}!{$colLetter}{$rowNumber}:{$colLetter}" . ($rowNumber + 1);
                $clearRequest = new \Google_Service_Sheets_ClearValuesRequest();
                $sheetService->spreadsheets_values->clear($spreadsheetId, $range, $clearRequest);

                // Optional: Reset formatting to white background
                $this->resetCellFormat($spreadsheetId, $colIndex, $rowIndex);
                return;
            }
        }
    }
}

private function resetCellFormat($spreadsheetId, $colIndex, $rowIndex) {
    $googleService = new GoogleService();
    $sheetService = $googleService->sheets();
    $sheetName = 'calendarOfActivities';

    try {
        // 1. Get the internal Sheet ID (GID) for the tab named 'calendarOfActivities'
        $spreadsheet = $sheetService->spreadsheets->get($spreadsheetId);
        $targetSheetId = 0;
        foreach ($spreadsheet->getSheets() as $s) {
            if ($s->getProperties()->getTitle() == $sheetName) {
                $targetSheetId = $s->getProperties()->getSheetId();
                break;
            }
        }

        

        // 2. Define the reset request
        $requests = [
            new \Google_Service_Sheets_Request([
                'repeatCell' => [
                    'range' => [
                        'sheetId' => $targetSheetId,
                        'startRowIndex' => $rowIndex,    // 0-based index
                        'endRowIndex' => $rowIndex + 2,  // Resets the title cell and participant cell below
                        'startColumnIndex' => $colIndex,
                        'endColumnIndex' => $colIndex + 1,
                    ],
                    'cell' => [
                        'userEnteredFormat' => [
                            'backgroundColor' => ['red' => 1.0, 'green' => 1.0, 'blue' => 1.0], // White
                            'horizontalAlignment' => 'LEFT',
                            'verticalAlignment' => 'TOP',
                            'textFormat' => [
                                'bold' => false,
                                'foregroundColor' => ['red' => 0.0, 'green' => 0.0, 'blue' => 0.0], // Black
                            ],
                        ],
                    ],
                    // Apply changes to background, alignment, and text format
                    'fields' => 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
                ],
            ]),
        ];

        $batchUpdateRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest([
            'requests' => $requests
        ]);

        $sheetService->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);

    } catch (\Exception $e) {
        Log::error("Failed to reset Google Sheet format: " . $e->getMessage());
    }
}

public function update(Request $request, $id)
{
    $validated = $request->validate([
    'event' => 'required|string|max:255',
    'email' => 'required|email|max:255',

    'start_time' => 'nullable|date_format:H:i',
    'end_time' => 'nullable|date_format:H:i',

    'startDate' => 'required|date',
    'endDate' => 'required|date|after_or_equal:startDate',

    'status' => 'required|string|in:Sure,Not Sure,Cancelled',

    'participants' => 'required|array|min:1',
    'participants.*.name' => 'required|string|max:255',
    'participants.*.email' => 'required|string|email|max:255',
]);

    DB::beginTransaction();
    try {
        $activity = Activity::findOrFail($id);
        $oldEventName = $activity->event_name; // Keep for finding it in Sheets

        // 1. Update Database
        $activity->update([
            'event_name' => $validated['event'],
            'organizer_email' => $validated['email'],
            'start_time' => $validated['start_time'] ?? null,
'end_time' => $validated['end_time'] ?? null,
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'status' => $validated['status'],
        ]);

        // Sync Participants: Delete old, add new
        ActivityParticipant::where('activity_id', $id)->delete();
        foreach ($validated['participants'] as $p) {
            ActivityParticipant::create([
                'activity_id' => $activity->id,
                'participant_name' => $p['name'],
                'participant_email' => $p['email'],
            ]);
        }

        $googleService = new GoogleService();
        $participantNames = collect($validated['participants'])
            ->map(fn($p) => "- {$p['name']} ({$p['email']})")
            ->implode("\n");

        // 2. Update Google Calendar
        if ($activity->google_event_id) {
            try {
                $calendar = $googleService->calendar();
                $calendarId = 'c_b6cdbe39e1e0c8a8ae12f63c5a0a83676770048dab630bf1ab25b8207bf2f672@group.calendar.google.com';
                
                $event = $calendar->events->get($calendarId, $activity->google_event_id);
                $event->setSummary($validated['event']);
                $event->setDescription("Participants:\n" . $participantNames);
                if (!empty($validated['start_time']) && !empty($validated['end_time'])) {

    // TIMED EVENT
    $start = new \Google\Service\Calendar\EventDateTime();
    $start->setDateTime(
        Carbon::parse($validated['startDate'] . ' ' . $validated['start_time'])
            ->toRfc3339String()
    );
    $start->setTimeZone('Asia/Manila');

    $end = new \Google\Service\Calendar\EventDateTime();
    $end->setDateTime(
        Carbon::parse($validated['endDate'] . ' ' . $validated['end_time'])
            ->toRfc3339String()
    );
    $end->setTimeZone('Asia/Manila');

} else {

    // ALL DAY EVENT
    $start = new \Google\Service\Calendar\EventDateTime();
    $start->setDate($validated['startDate']);

    $endDate = new \DateTime($validated['endDate']);
    $endDate->modify('+1 day');

    $end = new \Google\Service\Calendar\EventDateTime();
    $end->setDate($endDate->format('Y-m-d'));
}

$event->setStart($start);
$event->setEnd($end);

                $calendar->events->update($calendarId, $activity->google_event_id, $event);
            } catch (\Exception $e) {
                Log::error('Google Calendar Update Failed: ' . $e->getMessage());
            }
        }

        try {
    $this->removeFromSheets($oldEventName);
    $this->addToSheets($activity, $validated['participants']);
} catch (\Exception $e) {
    Log::error('Google Sheets Update Failed: ' . $e->getMessage());
}

        DB::commit();
        return response()->json(['success' => true, 'activity' => $activity->load('participants')]);

    } catch (\Throwable $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}
private function addToSheets($activity, $participants)
{
    $googleService = new GoogleService();
    $sheetService = $googleService->sheets();
    $spreadsheetId = '1qfC2MhygDsTM9t1bsWnnSwOZQQ3OEztcn-x5qCFOPhE';
    $sheetName = 'calendarOfActivities';

    $participantNames = collect($participants)
        ->map(fn($p) => "- {$p['name']} ({$p['email']})")
        ->implode("\n");

    $startDate = \Carbon\Carbon::parse($activity->start_date)->startOfWeek(\Carbon\Carbon::MONDAY);
    $searchFull = $startDate->format('F j'); 
    $searchShort = $startDate->format('M j'); 

    // Find the column based on week headers
    $headerRange = "{$sheetName}!A1:Z1";
    $headerResponse = $sheetService->spreadsheets_values->get($spreadsheetId, $headerRange);
    $headers = $headerResponse->getValues()[0] ?? [];

    $columnIndex = -1;
    foreach ($headers as $index => $headerValue) {
        if (stripos($headerValue, $searchFull) !== false || stripos($headerValue, $searchShort) !== false) {
            $columnIndex = $index;
            break;
        }
    }

    if ($columnIndex === -1) {
        throw new \Exception("No matching week span found for " . $searchFull);
    }

    $columnLetter = $this->getNameFromNumber($columnIndex);

    // Find next available row
    $colResponse = $sheetService->spreadsheets_values->get($spreadsheetId, "{$sheetName}!{$columnLetter}:{$columnLetter}");
    $existingRows = $colResponse->getValues() ?? [];
    $rowCount = count($existingRows);
    $targetRow = ($rowCount < 2) ? 2 : (floor($rowCount / 2) * 2) + 2;

    $timeText = 'No time specified';

if (!empty($activity->start_time) && !empty($activity->end_time)) {
    $timeText = date('g:i A', strtotime($activity->start_time))
        . ' - ' .
        date('g:i A', strtotime($activity->end_time));
}

$values = [
    [$activity->event_name],
    ["Time: " . $timeText . "\n\n" . $participantNames],
];

    $body = new \Google_Service_Sheets_ValueRange(['values' => $values]);
    $params = ['valueInputOption' => 'USER_ENTERED'];
    $sheetService->spreadsheets_values->update($spreadsheetId, "{$sheetName}!{$columnLetter}{$targetRow}", $body, $params);

    // Optional: Set background color based on status
    $colorMap = [
        'sure'      => ['red' => 0.0, 'green' => 0.48, 'blue' => 0.95], 
        'not sure'  => ['red' => 1.0, 'green' => 0.65, 'blue' => 0.0],   
        'cancelled' => ['red' => 0.9, 'green' => 0.1, 'blue' => 0.1],   
    ];
    $statusKey = strtolower($activity->status ?? '');
    $bgColor = $colorMap[$statusKey] ?? ['red' => 1, 'green' => 1, 'blue' => 1]; 

    // Set cell formatting
    $spreadsheet = $sheetService->spreadsheets->get($spreadsheetId);
    $targetSheetId = 0;
    foreach ($spreadsheet->getSheets() as $s) {
        if ($s->getProperties()->getTitle() == $sheetName) {
            $targetSheetId = $s->getProperties()->getSheetId();
            break;
        }
    }

    $requests = [
        new \Google_Service_Sheets_Request([
            'repeatCell' => [
                'range' => [
                    'sheetId' => $targetSheetId,
                    'startRowIndex' => $targetRow - 1,
                    'endRowIndex' => $targetRow + 1,
                    'startColumnIndex' => $columnIndex,
                    'endColumnIndex' => $columnIndex + 1,
                ],
                'cell' => [
                    'userEnteredFormat' => [
                        'backgroundColor' => $bgColor,
                        'horizontalAlignment' => 'CENTER',
                        'verticalAlignment' => 'MIDDLE',
                        'wrapStrategy' => 'WRAP',
                        'textFormat' => [
                            'bold' => true,
                            'foregroundColor' => ['red' => 1, 'green' => 1, 'blue' => 1],
                        ],
                    ],
                ],
                'fields' => 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
            ],
        ]),
    ];

    $batchUpdateRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest(['requests' => $requests]);
    $sheetService->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
}

}

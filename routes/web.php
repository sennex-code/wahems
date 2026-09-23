<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSubmissionController;
use App\Http\Controllers\CertificatesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventParticipantController;
use App\Http\Controllers\ExamAttemptController;
use App\Http\Controllers\ExamResultController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\QrScannerController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\SurveyResultController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\ExamManagementController;
use App\Http\Controllers\FacilitatorController;
use App\Http\Controllers\FaciSurveyController;

use App\Http\Controllers\ActivitiesController;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;





Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard.index');
    }
    return Inertia::render('Index');
})->middleware('guest')->name('login');


Route::get('/login', function () {
    return redirect('/');
});

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth')->name('dashboard.index');


// Event
Route::get('events', [EventController::class, 'index'])->middleware('auth')->name('event.index');
Route::post('create-event', [EventController::class, 'store'])->middleware('auth');
Route::put('update-event/{eventId}', [EventController::class, 'update'])->middleware('auth')->name('event.update');
Route::delete('event-delete/{eventId}', [EventController::class, 'destroy'])->middleware('auth')->name('event.destroy');
Route::get('events/{event}', [EventController::class, 'show'])->middleware('auth')->name('event.show');
Route::patch("event/toggle/{event}", [EventController::class, "toggleRegistration"])->middleware('auth')->name('event.toggle');


//Users
// Route::get('users', [UsersController::class, 'index'])->middleware('auth')->name('users.index');

// Typical convention
Route::post('/register', [UsersController::class, 'userRegister'])->name('register.form');
Route::delete('/user', [UsersController::class, 'destroy'])->name('user.destroy');


// Register
Route::post('register/{event}', [RegisterController::class, 'store'])->name('register-event.store');
Route::put('event/{eventId}/udpate/user/{participant}', action: [RegisterController::class, 'update'])->middleware('auth')->name('update-user.update');
Route::get('user-register/{eventId}', [RegisterController::class, 'show'])->name('user-register-event.show');
Route::post('event-register/{event}', [RegisterController::class, 'userRegister'])->name('user-registration-form.post');
Route::post('create-participant/{event}', [RegisterController::class, 'userCreate'])->name('create-participant-form.post');


//Attendance
Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index')->middleware('auth');
Route::get('attendance/{event}', [AttendanceController::class, 'show'])->name('attendance.show')->middleware('auth');
Route::put('update-attendance/{attendance}', [AttendanceController::class, 'update'])->middleware('auth')->name('attendance.update');
Route::post('presentAllAttendance/{attendanceCode}', [AttendanceController::class, 'presentAll'])->middleware('auth')->name('attendance.presentAll');
Route::post('presentAllParticipant/{eventId}', [AttendanceController::class, 'presentAllParticipantToday'])->middleware('auth')->name('attendance.presentAllParticipantToday');

// AttendanceSubmission
Route::get('attendance/event/{eventId}/qr', [AttendanceSubmissionController::class, 'show'])->name('attendanceSubmission.show')->middleware('auth');
Route::get('attendance/event/{eventId}/verify', [AttendanceSubmissionController::class, 'verify'])->name('attendanceSubmission.verify');
Route::patch('attendance/event/{eventId}/submit', [AttendanceSubmissionController::class, 'patch'])->name('attendanceSubmission.patch');

// Survey
Route::get('survey', [SurveyController::class, 'index'])->name('survey.index')->middleware('auth');
Route::patch('survey/update/{survey}', [SurveyController::class, 'update'])->name('survey.update')->middleware('auth');
Route::get('event/{event}/survey/{survey}/form', [SurveyController::class, "show"])->name('survey.show');
Route::post("event/{event}/survey/{survey}/submit", [SurveyController::class, 'create'])->name("survey.create");
Route::get('event/{event}/survey/{survey}/finished', [SurveyController::class, "finished"])->name('survey.finished');
Route::get('event/{eventId}/survey/{surveyId}/qr', [SurveyController::class, "showQr"])->name('survey.showQr');
Route::get('event/{event}/survey/{survey}/statistics', [SurveyController::class, "showStatistics"])->name('survey.statistics');




// Exams
Route::get('examsResults', [ExamResultController::class, 'index'])->name('exams.index')->middleware('auth');
Route::get('event/exam/{eventId}/{eventParticipantId}/start', [ExamAttemptController::class, 'start'])->name('exam.start');
Route::get('event/exam/{eventId}/{examType}/verify-participant', [ExamAttemptController::class, 'verifyParticipantEligibility'])->name('exam.verifyParticipantEligibility');
Route::get('/exam-results/{eventId}/export', [ExamResultController::class, 'exportEvent'])->name('examResults.exportEvent');
Route::post('/exam-results/{eventId}/{examType}/{isActive}', [ExamAttemptController::class, 'setIsActive'])->name('examAttempts.setIsActive');
Route::post('event/exam/{eventId}/{examType}/verify-participant', [ExamAttemptController::class, 'startAttempt'])->name('exam.startAttempt');
Route::post('/exam-attempts/submit', [ExamAttemptController::class, 'submit'])->name('examAttempts.submit');
Route::get('/exam-attempts/{attemptId}/score', [ExamAttemptController::class, 'score'])->name('examAttempts.showScore');
//Exam admin
Route::get('/exam-management/{bank}', [ExamManagementController::class, 'index'])->name('examManagement.index')->middleware('auth');
Route::get('exam-management/{bank}', [ExamManagementController::class, 'index']);
Route::post('exam-management/{bank}', [ExamManagementController::class, 'store']);
Route::put('exam-management/{bank}/{id}', [ExamManagementController::class, 'update']);
Route::delete('exam-management/{bank}/{id}', [ExamManagementController::class, 'destroy']);

// SurveyResult
Route::get('survey/{survey}/submission/{submission}', [SurveyResultController::class, 'show'])->middleware('auth')->name('submission.show');
Route::get('survey/{survey}/submission', [SurveyResultController::class, "index"])->middleware('auth')->name('submission.index');

// Verification                                                                                             
Route::get('event/{event}/survey/{survey}', [VerificationController::class, 'show'])->name('verification.show');
Route::post('event/{event}/survey/{survey}/verify', [VerificationController::class, 'verify'])->name("verifySurvey.verify");


//Facility Management
Route::get('facilities-management', [FacilityController::class, 'index'])->name('facilities.index')->middleware('auth');
Route::post('create-facility', [FacilityController::class, 'store'])->middleware('auth');
Route::delete('delete-facility/{facility}', [FacilityController::class, 'destroy'])->middleware('auth')->name('facilities.destroy');
Route::patch('/update-facility/{id}', [FacilityController::class, 'update'])->name('facility.update');




//EventParticipant
Route::delete('eventParticipant/{eventParticipantId}', [EventParticipantController::class, 'destroy'])->middleware('auth')->name('event-participant.destroy');
Route::get('events/{eventId}/search', [EventParticipantController::class, 'search'])->middleware('auth')->name('event.search');






// calendar of event 
// TODO :
Route::get('/calendar-of-event', [ActivitiesController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('CalendarOfActivities');
Route::post('/activities', [ActivitiesController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('activities.store');
Route::get('/api/activities', [ActivitiesController::class, 'getActivities']);
Route::get('/api/search-users', [ActivitiesController::class, 'searchUsers']);
Route::delete('/activities/{id}', [ActivitiesController::class, 'destroy']);
Route::put('/activities/{id}', [ActivitiesController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('activities.update');

// Certificates
Route::get('certificates', [CertificatesController::class, 'index'])->name('certificates.index')->middleware('auth');
Route::get('/certificates/get-participants/{eventId}', [CertificatesController::class, 'getParticipants']);
Route::get('/certificates/{participantId}/{eventId}', [CertificatesController::class, 'showMedTechCertificate'])->name('certificates.medtech.show')->middleware('auth');
Route::post('/certificates/email-upload', [CertificatesController::class, 'emailMedTechCertificateUpload'])
    ->middleware('auth')
    ->name('certificates.email-upload');

// Admin
Route::get('admin', [AdminController::class, 'index'])->name('admin.index')->middleware('auth');
Route::get('admin/get-user-list', [AdminController::class, 'getUserList'])->name('admin.getUserList')->middleware('auth');
Route::get('admin/get-role', [AdminController::class, 'getRole'])->name('admin.getRole')->middleware('auth');
Route::get('admin/get-requests', [AdminController::class, 'getRequets'])->name('admin.getRequests')->middleware('auth');
Route::post('admin/set-role/{userId}/{role}', [AdminController::class, 'setRole'])->name('admin.setRole')->middleware('auth');

// Facilitator
Route::get('/facilitators', [FacilitatorController::class, 'index'])->name('facilitators.index')->middleware('auth');
Route::post('/facilitators', [FacilitatorController::class, 'store'])->name('facilitators.store')->middleware('auth');

Route::put('/facilitators/{facilitator}', [FacilitatorController::class, 'update'])->name('facilitators.update')->middleware('auth');
Route::delete('/facilitators/{facilitator}', [FacilitatorController::class, 'destroy'])->name('facilitators.destroy')->middleware('auth');

// Facilitator Survey Routes

Route::get('/events/{event}/facilitator-surveys/verify', [FaciSurveyController::class, 'showVerificationForm'])
    ->name('facilitator-surveys.verifyForm');
Route::post('/events/{event}/facilitator-surveys/verify', [FaciSurveyController::class, 'verifyFaciSurvey'])
    ->name('facilitator-surveys.verify');
Route::get('/events/{event}/facilitator-surveys', [FaciSurveyController::class, 'index'])
    ->name('facilitator-surveys.index');
Route::post('/facilitator-surveys/store', [FaciSurveyController::class, 'store'])
    ->name('facilitator-survey.store');
Route::get('facilitator-surveys/results/{eventId}/{surveyId}', [FaciSurveyController::class, 'showResults'])
    ->name('facilitator-surveys.results');
Route::get('eventFacilitator/{eventId}', [FaciSurveyController::class, 'getEventFacilitators'])->name('eventFacilitator.get');

// ECXEL
Route::get('event/export/{eventId}', [EventController::class, 'export'])->name('xlsx.export')->middleware('auth');
Route::get('survey/export/{surveySubmissionId}', [SurveyResultController::class, 'export'])->name('survey.export')->middleware('auth');
Route::post('admin/set-status/{userId}/{status}', [AdminController::class, 'setStatus'])->name('admin.setStatus')->middleware('auth');
Route::post('admin/revoke-access/{userId}', [AdminController::class, 'revokeAccess'])->name('admin.revokeAccess')->middleware('auth');

//QRScanner 
// Route::get('qr-scanner', [QrScannerController::class, 'index'])->name('qr-scanner.index')->middleware('auth');
Route::get('registered-qr/{attendance_code}', [QrScannerController::class, 'show'])->name('registered.show');

// Handle retrieving of option fields
Route::get('get-regions', [RegionsController::class, 'getRegions'])->middleware('auth');
Route::get('get-provinces/{psgcCode}', [RegionsController::class, 'getProvinces'])->middleware(middleware: 'auth');
Route::get('get-municipalities/{psgcCode}', [RegionsController::class, 'getMunicipalities'])->middleware(middleware: 'auth');
Route::get('get-barangay/{psgcCode}', action: [RegionsController::class, 'getBarangays'])->middleware(middleware: 'auth');
Route::get('get-facilities/{psgcCode}', action: [RegionsController::class, 'getFacilities'])->middleware(middleware: 'auth');

// Route::get('settings/appearance', function () {
//     return Inertia::render('settings/appearance');
// })->name('appearance.edit')->middleware(['auth', 'verified']);

require __DIR__ . '/settings.php';

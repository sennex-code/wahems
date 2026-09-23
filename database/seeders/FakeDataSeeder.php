<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityParticipant;
use App\Models\Attendance;
use App\Models\Cluster;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\ExamBankQuestion;
use App\Models\Facilitator;
use App\Models\FacilitatorEventParticipantAnswer;
use App\Models\FacilitatorSurvey;
use App\Models\FacilitatorSurveyAttempt;
use App\Models\Facility;
use App\Models\Participant;
use App\Models\Question;
use App\Models\QuestionChoice;
use App\Models\Survey;
use App\Models\SurveyQuestionOption;
use App\Models\SurveySubmission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class FakeDataSeeder extends Seeder
{
    private const DESIGNATIONS = [
        'Municipal Health Officer',
        'Rural Health Physician',
        'Public Health Nurse',
        'Rural Health Midwife',
        'Barangay Health Worker',
        'Medical Technologist',
        'Pharmacist',
        'Dentist',
        'Radiologic Technologist',
        'Nurse',
        'Registrar',
        'Encoder',
        'Administrative Officer',
        'Health Education and Promotion Officer',
    ];

    private const EVENT_TOPICS = [
        'WAHtermelon: Electronic Professional Profile',
        'E-Claims System Training',
        'National Health Insurance Program Orientation',
        'Primary Care Provider Network Training',
        'PhilHealth Konsulta Package Orientation',
        'Z Benefits and Case Rates Training',
        'Outpatient Benefit Package Training',
        'Data Migration and AMBER',
    ];

    public function run(): void
    {
        $this->call([
            FacilitatorsSeeder::class,
            FacilitatorQuestionnaireSeeder::class,
            FacilitatorChoicesSeeder::class,
        ]);

        DB::transaction(function () {
            $users = $this->seedUsers();
            $participants = $this->seedParticipants();

            $geo = $this->resolveGeo();

            $facilities = [];
            if ($geo !== null) {
                $facilities = $this->seedFacilities($geo);
            }

            $events = $this->seedEvents($users, $geo, $facilities);
            $eventParticipants = $this->seedEventParticipants($events, $participants);
            $this->seedAttendance($eventParticipants);

            if ($events->isNotEmpty()) {
                $facilitators = $this->seedFacilitators();
                $this->attachFacilitatorsToEvents($events, $facilitators);
                $this->seedFacilitatorSurveys($events, $facilitators, $eventParticipants);

                $this->seedSurveys($events, $eventParticipants);
                $this->seedExams($events, $eventParticipants);
                $this->seedCertificates($events, $eventParticipants);
            }

            $this->seedActivities($users);
        });

        $this->command?->info('Fake data seeded successfully.');
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function seedUsers(): \Illuminate\Support\Collection
    {
        $users = collect();

        $users->push(User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'password' => 'password',
            'role' => 'Admin',
            'email_verified_at' => now(),
        ]));

        foreach (range(1, 5) as $i) {
            $users->push(User::create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'password' => 'password',
                'role' => 'Staff',
                'email_verified_at' => now(),
            ]));
        }

        return $users;
    }

    /**
     * @return \Illuminate\Support\Collection<int, Participant>
     */
    private function seedParticipants(): \Illuminate\Support\Collection
    {
        $participants = collect();

        foreach (range(1, 120) as $i) {
            $gender = fake()->randomElement(['Male', 'Female']);
            $birthday = fake()->dateTimeBetween('-60 years', '-21 years');

            $participants->push(Participant::create([
                'first_name' => fake()->firstName($gender === 'Male' ? 'male' : 'female'),
                'middle_initial' => fake()->optional(0.7)->randomLetter(),
                'last_name' => fake()->lastName(),
                'suffix' => fake()->optional(0.05)->randomElement(['Jr.', 'Sr.', 'III', 'IV']),
                'designation' => fake()->randomElement(self::DESIGNATIONS),
                'age' => $birthday->diff(today())->y,
                'birthday' => $birthday->format('Y-m-d'),
                'email' => fake()->unique()->safeEmail(),
                'gender' => $gender,
                'mobile_number' => '09' . fake()->numerify('#########'),
                'cpd' => fake()->boolean(60),
                'prc_license' => fake()->optional(0.7)->numerify(str_repeat('#', 7)),
                'expiry_date' => fake()->optional(0.5)->dateTimeBetween('+1 month', '+3 years')?->format('Y-m-d'),
            ]));
        }

        return $participants;
    }

    /**
     * @return array{region: string, province: string, municipality: string, barangay: string, names: array{region: string, province: string, municipality: string, barangay: string}}
     */
    private function resolveGeo(): ?array
    {
        $region = \App\Models\Region::inRandomOrder()->first();

        if ($region === null) {
            return $this->seedPlaceholderGeo();
        }

        $province = \App\Models\Province::where('region_id', $region->id)->inRandomOrder()->first();
        if ($province === null) {
            return $this->seedPlaceholderGeo();
        }

        $municipality = \App\Models\Municipality::where('province_id', $province->id)->inRandomOrder()->first();
        if ($municipality === null) {
            return $this->seedPlaceholderGeo();
        }

        $barangay = \App\Models\Barangay::where('municipality_id', $municipality->id)->inRandomOrder()->first();
        if ($barangay === null) {
            return $this->seedPlaceholderGeo();
        }

        return [
            'region' => $region->psgc_10_digit_code,
            'province' => $province->psgc_10_digit_code,
            'municipality' => $municipality->psgc_10_digit_code,
            'barangay' => $barangay->psgc_10_digit_code,
            'names' => [
                'region' => $region->name,
                'province' => $province->name,
                'municipality' => $municipality->name,
                'barangay' => $barangay->name,
            ],
        ];
    }

    /**
     * Fallback when the official geolocation tables are empty, so the demo
     * still works on a fresh database.
     *
     * @return array{region: string, province: string, municipality: string, barangay: string, names: array{region: string, province: string, municipality: string, barangay: string}}
     */
    private function seedPlaceholderGeo(): array
    {
        $this->command?->warn('Geolocation tables are empty. Creating placeholder region/province/municipality/barangay records.');

        $regionCode = '99';
        $provinceCode = '9901';
        $municipalityCode = '990101';
        $barangayCode = '990101001';

        \App\Models\Region::updateOrCreate(['psgc_10_digit_code' => $regionCode], [
            'name' => 'Region of Demo',
            'code' => $regionCode,
            'psgc_10_digit_code' => $regionCode,
            'population' => 1000000,
        ]);

        $province = \App\Models\Province::updateOrCreate(['psgc_10_digit_code' => $provinceCode], [
            'code' => $provinceCode,
            'psgc_10_digit_code' => $provinceCode,
            'region_id' => \App\Models\Region::where('psgc_10_digit_code', $regionCode)->value('id'),
            'name' => 'Province of Demo',
            'income_class' => '1st Class',
            'population' => 500000,
        ]);

        $municipality = \App\Models\Municipality::updateOrCreate(['psgc_10_digit_code' => $municipalityCode], [
            'code' => $municipalityCode,
            'psgc_10_digit_code' => $municipalityCode,
            'province_id' => $province->id,
            'name' => 'Municipality of Demo',
            'geo_level' => 'Mun',
            'income_class' => '1st Class',
            'population' => 100000,
        ]);

        \App\Models\Barangay::updateOrCreate(['psgc_10_digit_code' => $barangayCode], [
            'code' => $barangayCode,
            'psgc_10_digit_code' => $barangayCode,
            'municipality_id' => $municipality->id,
            'name' => 'Barangay Demo',
            'urban_rural' => 'Urban',
            'population' => 25000,
        ]);

        return [
            'region' => $regionCode,
            'province' => $provinceCode,
            'municipality' => $municipalityCode,
            'barangay' => $barangayCode,
            'names' => [
                'region' => 'Region of Demo',
                'province' => 'Province of Demo',
                'municipality' => 'Municipality of Demo',
                'barangay' => 'Barangay Demo',
            ],
        ];
    }

    /**
     * @param  array{region: string, province: string, municipality: string, barangay: string, names: array{region: string, province: string, municipality: string, barangay: string}}  $geo
     * @return \Illuminate\Support\Collection<int, Facility>
     */
    private function seedFacilities(array $geo): \Illuminate\Support\Collection
    {
        $facilities = collect();
        $usedCodes = Facility::where('code', 'like', 'WAH%')->pluck('code')->all();
        $usedShortCodes = Facility::pluck('short_code')->all();

        foreach (range(1, 15) as $i) {
            do {
                $code = 'WAH-' . strtoupper(Str::random(8));
            } while (in_array($code, $usedCodes, true));
            $usedCodes[] = $code;

            do {
                $shortCode = strtoupper(Str::random(6));
            } while (in_array($shortCode, $usedShortCodes, true));
            $usedShortCodes[] = $shortCode;

            $facilities->push(Facility::create([
                'facility_name' => $geo['names']['municipality'] . ' ' . fake()->randomElement(['Rural Health Unit', 'Health Center', 'Primary Care Facility', 'Barangay Health Station']),
                'code' => $code,
                'short_code' => $shortCode,
                'region_code' => $geo['region'],
                'province_code' => $geo['province'],
                'municipality_code' => $geo['municipality'],
                'barangay_code' => $geo['barangay'],
            ]));
        }

        return $facilities;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $users
     * @param  array{region: string, province: string, municipality: string, barangay: string, names: array{region: string, province: string, municipality: string, barangay: string}}|null  $geo
     * @param  \Illuminate\Support\Collection<int, Facility>  $facilities
     * @return \Illuminate\Support\Collection<int, Event>
     */
    private function seedEvents($users, ?array $geo, $facilities): \Illuminate\Support\Collection
    {
        $events = collect();

        foreach (range(1, 8) as $i) {
            $audience = $users->random();
            $geoData = $geo ?? $this->resolveGeo();
            $type = $i <= 5 ? 'Training' : fake()->randomElement(['Training', 'Cluster']);
            $facility = $type === 'Cluster' ? null : $facilities->random();

            $starts = now()->subDays(60)->addDays(($i - 1) * 20);

            $data = [
                'code' => Str::random(20),
                'name' => fake()->randomElement(self::EVENT_TOPICS) . ' - ' . fake()->randomElement(['Batch 1', 'Batch 2', 'Refresher', 'District ' . fake()->numberBetween(1, 4)]),
                'facility_code' => $facility?->code,
                'user_id' => $audience->id,
                'type' => $type,
                'facility' => $facility?->facility_name,
                'region' => $geoData['region'],
                'province' => $geoData['province'],
                'municipality' => $geoData['municipality'],
                'barangay' => $geoData['barangay'],
                'address' => $geoData['names']['barangay'] . ', ' . $geoData['names']['municipality'] . ', ' . $geoData['names']['province'],
                'leader' => fake()->name(),
                'position' => fake()->randomElement(['Training Director', 'Chief of Hospital', 'Provincial Officer', 'Coordinator']),
                'required_hours' => fake()->numberBetween(8, 40),
                'is_registration_active' => fake()->boolean(80),
            ];

            if (Schema::hasColumn('events', 'start_at') && Schema::hasColumn('events', 'end_at')) {
                $data['start_at'] = $starts->format('Y-m-d');
                $data['end_at'] = $starts->addDays(fake()->numberBetween(1, 3))->format('Y-m-d');
            }

            $events->push(Event::create($data));
        }

        $this->seedClusters($events, $geo);

        return $events;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  array{region: string, province: string, municipality: string, barangay: string, names: array{region: string, province: string, municipality: string, barangay: string}}|null  $geo
     */
    private function seedClusters($events, ?array $geo): void
    {
        $facilityIds = Facility::pluck('id')->all();

        foreach ($events as $event) {
            foreach (range(1, fake()->numberBetween(2, 3)) as $i) {
                $geoData = $geo ?? $this->resolveGeo();

                $cluster = Cluster::create([
                    'event_id' => $event->id,
                    'region' => $geoData['region'],
                    'province' => $geoData['province'],
                    'municipality' => $geoData['municipality'],
                    'barangay' => $geoData['barangay'],
                    'cluster_name' => $event->name . ' - Cluster ' . $i,
                    'signatory' => fake()->name(),
                    'position' => fake()->randomElement(['Chief of Hospital', 'Provincial Health Officer', 'Cluster Head']),
                    'require_signatory' => fake()->boolean(),
                ]);

                if ($facilityIds !== []) {
                    $cluster->facilities()->syncWithoutDetaching(fake()->randomElements($facilityIds, fake()->numberBetween(1, 2)));
                }
            }
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, Participant>  $participants
     * @return \Illuminate\Support\Collection<int, EventParticipant>
     */
    private function seedEventParticipants($events, $participants): \Illuminate\Support\Collection
    {
        $eventParticipants = collect();
        $usedAttendanceCodes = EventParticipant::pluck('attendance_code')->all();
        $shuffled = $participants->shuffle();

        foreach ($events as $event) {
            $batch = $shuffled->splice(0, fake()->numberBetween(12, 18));
            $clusters = $event->clusters;
            $participantClusterName = $event->type === 'Cluster' ? $clusters->first()?->cluster_name : null;

            foreach ($batch as $index => $participant) {
                do {
                    $attendanceCode = Str::random(10);
                } while (in_array($attendanceCode, $usedAttendanceCodes, true));
                $usedAttendanceCodes[] = $attendanceCode;

                $cluster = null;
                if ($event->type === 'Cluster' && $clusters->isNotEmpty()) {
                    $cluster = $clusters->random();
                }

                $eventParticipants->push(EventParticipant::create([
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                    'registration_id' => $index + 1,
                    'participant_cluster' => $participantClusterName,
                    'cluster_id' => $cluster?->id,
                    'facility_name' => in_array($event->type, ['Training', 'Cluster'], true) ? $event->facility : null,
                    'total_hours_attended' => 0,
                    'attendance_code' => $attendanceCode,
                ]));
            }
        }

        return $eventParticipants;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, EventParticipant>  $eventParticipants
     */
    private function seedAttendance($eventParticipants): void
    {
        $hasDates = Schema::hasColumn('events', 'start_at') && Schema::hasColumn('events', 'end_at');

        foreach ($eventParticipants as $eventParticipant) {
            $days = [];

            if ($hasDates) {
                $event = $eventParticipant->event;
                $from = \Carbon\Carbon::parse($event->start_at);
                $to = \Carbon\Carbon::parse($event->end_at);

                while ($from->lte($to)) {
                    $days[] = $from->copy();
                    $from->addDay();
                }
            }

            if ($days === []) {
                foreach (range(1, fake()->numberBetween(1, 3)) as $i) {
                    $days[] = now()->subDays(fake()->numberBetween(0, 30));
                }
            }

            $totalHours = 0;

            foreach ($days as $day) {
                $hours = fake()->numberBetween(1, 8);
                $totalHours += $hours;

                Attendance::create([
                    'event_participants_id' => $eventParticipant->id,
                    'date_on' => $day->format('Y-m-d H:i:s'),
                    'hasAttended' => fake()->boolean(90) ? 1 : 0,
                    'hours_attended' => $hours,
                ]);
            }

            $eventParticipant->update(['total_hours_attended' => $totalHours]);
        }
    }

    private function randomEntries(\Illuminate\Support\Collection $collection, int $max): \Illuminate\Support\Collection
    {
        if ($collection->isEmpty()) {
            return $collection;
        }

        return $collection->random(min($max, $collection->count()));
    }

    /**
     * @return \Illuminate\Support\Collection<int, Facilitator>
     */
    private function seedFacilitators(): \Illuminate\Support\Collection
    {
        $existing = collect();

        foreach (range(1, 12) as $i) {
            $name = fake()->name();

            if (Facilitator::where('name', $name)->exists()) {
                continue;
            }

            $existing->push(Facilitator::create(['name' => $name]));
        }

        return $existing;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, Facilitator>  $facilitators
     */
    private function attachFacilitatorsToEvents($events, $facilitators): void
    {
        foreach ($events as $event) {
            $event->facilitators()->syncWithoutDetaching($facilitators->random(fake()->numberBetween(2, 4))->pluck('id'));
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, Facilitator>  $facilitators
     * @param  \Illuminate\Support\Collection<int, EventParticipant>  $eventParticipants
     */
    private function seedFacilitatorSurveys($events, $facilitators, $eventParticipants): void
    {
        $questionnaires = \App\Models\FacilitatorQuestionnaire::get();
        $ratingChoices = \App\Models\FacilitatorChoice::whereNotNull('choice_value')->pluck('id')->all();

        if ($questionnaires->isEmpty() || $ratingChoices === []) {
            return;
        }

        // Link rating questionnaires to the 1-5 rating choices.
        foreach ($questionnaires->where('question_type', 'rating') as $questionnaire) {
            DB::table('facilitator_question_option')->insertOrIgnore(
                collect($ratingChoices)->map(fn ($choiceId) => [
                    'questionnaire_id' => $questionnaire->id,
                    'choice_id' => $choiceId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all()
            );
        }

        foreach ($events as $event) {
            $eventFacilitators = $event->facilitators;

            foreach ($eventFacilitators as $facilitator) {
                $survey = FacilitatorSurvey::updateOrCreate([
                    'facilitator_id' => $facilitator->id,
                    'event_id' => $event->id,
                ], [
                    'name' => 'Facilitator Evaluation',
                    'isActive' => fake()->boolean(70),
                ]);

                // Attach all questionnaires to this survey.
                $survey->questions()->sync($questionnaires->pluck('id'));

                $participants = $this->randomEntries(
                    $eventParticipants->where('event_id', $event->id),
                    fake()->numberBetween(4, 8)
                );

                foreach ($participants as $eventParticipant) {
                    $attempt = FacilitatorSurveyAttempt::create([
                        'survey_id' => $survey->id,
                        'event_participant_id' => $eventParticipant->id,
                        'status' => 'submitted',
                        'submitted_at' => now()->subDays(fake()->numberBetween(1, 20)),
                    ]);

                    foreach ($questionnaires as $questionnaire) {
                        if ($questionnaire->question_type === 'rating') {
                            FacilitatorEventParticipantAnswer::create([
                                'survey_attempt_id' => $attempt->id,
                                'questionnaire_id' => $questionnaire->id,
                                'choice_id' => $ratingChoices[array_rand($ratingChoices)],
                            ]);
                        } else {
                            FacilitatorEventParticipantAnswer::create([
                                'survey_attempt_id' => $attempt->id,
                                'questionnaire_id' => $questionnaire->id,
                                'answer_text' => fake()->optional(0.8)->sentence(),
                            ]);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, EventParticipant>  $eventParticipants
     */
    private function seedSurveys($events, $eventParticipants): void
    {
        $questionIds = $this->ensureSurveyQuestions();

        if ($questionIds->isEmpty()) {
            return;
        }

        foreach ($events as $event) {
            $survey = Survey::updateOrCreate([
                'event_id' => $event->id,
            ], [
                'title' => 'Event Evaluation Survey',
                'is_active' => fake()->boolean(70),
            ]);

            $participants = $this->randomEntries(
                $eventParticipants->where('event_id', $event->id),
                fake()->numberBetween(5, 10)
            );

            foreach ($participants as $eventParticipant) {
                if (SurveySubmission::where('survey_id', $survey->id)
                    ->where('event_participants_id', $eventParticipant->id)->exists()) {
                    continue;
                }

                $submission = SurveySubmission::create([
                    'survey_id' => $survey->id,
                    'event_participants_id' => $eventParticipant->id,
                    'submitted_at' => now()->subDays(fake()->numberBetween(1, 30)),
                ]);

                foreach ($questionIds as $questionId) {
                    $question = Question::find($questionId);
                    $options = $question->surveyQuestionOptions;

                    if ($question->type === 'text' || $options->isEmpty()) {
                        \App\Models\EventParticipantAnswer::create([
                            'survey_submission_id' => $submission->id,
                            'question_id' => $questionId,
                            'question_option_id' => null,
                            'text_answer' => fake()->optional(0.85)->sentence(),
                        ]);
                    } else {
                        \App\Models\EventParticipantAnswer::create([
                            'survey_submission_id' => $submission->id,
                            'question_id' => $questionId,
                            'question_option_id' => $options->random()->id,
                            'text_answer' => null,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function ensureSurveyQuestions(): \Illuminate\Support\Collection
    {
        $categories = [
            'Overall Satisfaction' => [
                'How would you rate the overall event?',
                'How likely are you to recommend this training to a colleague?',
            ],
            'Content and Delivery' => [
                'The topics were relevant to my work.',
                'The presenter explained the materials clearly.',
                'The training materials were easy to follow.',
            ],
            'Logistics' => [
                'The venue was accessible and comfortable.',
                'The schedule was followed properly.',
            ],
            'Feedback' => [
                'Any comments or suggestions for improvement?',
            ],
        ];

        $questionIds = collect();

        foreach ($categories as $category => $questions) {
            foreach ($questions as $index => $questionName) {
                $isText = $category === 'Feedback';

                $question = Question::updateOrCreate(
                    ['question_name' => $questionName],
                    [
                        'type' => $isText ? 'text' : 'rating',
                        'category' => $category,
                    ]
                );

                $questionIds->push($question->id);

                if (! $isText && $question->surveyQuestionOptions()->count() === 0) {
                    foreach (['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] as $i => $label) {
                        SurveyQuestionOption::create([
                            'question_id' => $question->id,
                            'label' => $label,
                            'value' => (string) ($i + 1),
                        ]);
                    }
                }
            }
        }

        return $questionIds;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, EventParticipant>  $eventParticipants
     */
    private function seedExams($events, $eventParticipants): void
    {
        $exams = [];

        foreach ($events as $event) {
            if (! in_array($event->type, ['Training', 'Cluster'], true)) {
                continue;
            }

            $bank = fake()->randomElement(['private', 'lgu', 'specialized']);

            foreach (['pre', 'post'] as $examType) {
                if (Exam::where('event_id', $event->id)->where('exam_type', $examType)->exists()) {
                    continue;
                }

                $titlePrefix = match ($bank) {
                    'lgu' => 'WAHtermelon Exam for LGU',
                    'specialized' => 'WAHtermelon Exam for E-Claims',
                    default => 'WAHtermelon Exam for Private',
                };

                $exam = Exam::create([
                    'event_id' => $event->id,
                    'exam_type' => $examType,
                    'bank' => $bank,
                    'title' => $titlePrefix . ($examType === 'pre' ? ' Pre Exam' : ' Post Exam'),
                    'isActive' => true,
                ]);

                $exams[] = $exam;
            }
        }

        $this->ensureQuestionBank();

        foreach ($exams as $exam) {
            $questions = ExamBankQuestion::where('bank', $exam->bank)->get();

            if ($questions->isEmpty()) {
                continue;
            }

            $exam->examQuestionBank()->sync($questions->take(10)->pluck('id'));

            $targetAttempts = $this->randomEntries(
                $eventParticipants->where('event_id', $exam->event_id),
                fake()->numberBetween(5, 12)
            );

            foreach ($targetAttempts as $eventParticipant) {
                if (ExamAttempt::where('exam_id', $exam->id)
                    ->where('participant_id', $eventParticipant->id)->exists()) {
                    continue;
                }

                $bankQuestions = $questions->take(10);
                $score = 0;

                $submittedAt = now()->subDays(fake()->numberBetween(1, 15));

                $attempt = ExamAttempt::create([
                    'exam_id' => $exam->id,
                    'participant_id' => $eventParticipant->id,
                    'number_of_items' => $bankQuestions->count(),
                    'score' => 0,
                    'started_at' => (clone $submittedAt)->subMinutes(fake()->numberBetween(10, 90)),
                    'submitted_at' => $submittedAt,
                ]);

                foreach ($bankQuestions as $question) {
                    $choices = $question->choices;
                    if ($choices->isEmpty()) {
                        continue;
                    }

                    $chosen = $choices->random();

                    if ($chosen->is_correct) {
                        $score++;
                    }

                    ExamAttemptAnswer::create([
                        'attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                        'selected_choice_id' => $chosen->id,
                    ]);
                }

                $attempt->update(['score' => $score]);
            }
        }
    }

    private function ensureQuestionBank(): void
    {
        $banks = [
            'private' => [
                'PhilHealth membership is valid for a Lifetime Member when the member has paid at least ___ contribution months.',
                'What does case rate mean under the National Health Insurance Program?',
                'How can a member check the status of their PhilHealth registration?',
                'Which of the following is a PhilHealth benefit package?',
                'What document is required when filing a PhilHealth claim?',
                'The premium contribution rate for directly and self-employed individuals is calculated based on what?',
                'Which is NOT covered by the Z Benefits package?',
                'What is the role of the employer under PhilHealth?',
            ],
            'lgu' => [
                'What is the purpose of the WAHtermelon system?',
                'Electronic Professional Profile (EPP) is primarily used for what?',
                'Which office verifies the submitted professional profiles?',
                'What year should member data be migrated for AMBER compliance?',
                'How does the E-Claims system speed up reimbursement?',
                'Who can access the municipal level dashboard?',
                'What is the required facility classification for LGU-based claims?',
                'Which module tracks the training attendance of health workers?',
            ],
            'specialized' => [
                'E-Claims is best described as which of the following?',
                'What is a claim reference number (CRN)?',
                'Which benefit can be claimed under the Konsulta Package?',
                'What happens to a claim with incomplete attachments?',
                'How many days does PhilHealth have to settle a complete claim?',
                'Which form is used to update member contact information?',
                'What is the penalty for filing a fraudulent claim?',
                'Which of the following documents must accompany an emergency admission claim?',
            ],
        ];

        foreach ($banks as $bank => $questions) {
            foreach ($questions as $questionText) {
                if (ExamBankQuestion::where('bank', $bank)->where('question_text', $questionText)->exists()) {
                    continue;
                }

                $question = ExamBankQuestion::create([
                    'bank' => $bank,
                    'question_text' => $questionText,
                ]);

                $correctIndex = fake()->numberBetween(0, 3);

                foreach (range(0, 3) as $i) {
                    $choice = fake()->sentence(3);

                    QuestionChoice::create([
                        'question_id' => $question->id,
                        'choice_text' => $choice,
                        'is_correct' => $i === $correctIndex,
                    ]);
                }
            }
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Event>  $events
     * @param  \Illuminate\Support\Collection<int, EventParticipant>  $eventParticipants
     */
    private function seedCertificates($events, $eventParticipants): void
    {
        foreach ($events as $event) {
            $candidates = $this->randomEntries(
                $eventParticipants->where('event_id', $event->id),
                fake()->numberBetween(3, 6)
            );

            foreach ($candidates as $eventParticipant) {
                DB::table('certificates')->insertOrIgnore([
                    'event_participants_id' => $eventParticipant->id,
                    'event_id' => $event->id,
                    'certificate_sent' => fake()->boolean(),
                    'email' => $eventParticipant->participant->email,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $users
     */
    private function seedActivities($users): void
    {
        foreach (range(1, 12) as $i) {
            $start = now()->subMonths(4)->addDays(fake()->numberBetween(0, 110));

            $activity = Activity::create([
                'event_name' => fake()->randomElement(self::EVENT_TOPICS) . ' - Session ' . fake()->numberBetween(1, 8),
                'organizer_email' => $users->random()->email,
                'start_date' => $start->toDateString(),
                'start_time' => fake()->time('H:i'),
                'end_date' => $start->copy()->addDays(fake()->numberBetween(0, 2))->toDateString(),
                'end_time' => fake()->time('H:i'),
                'status' => fake()->randomElement(['confirmed', 'tentative', 'cancelled', 'completed']),
                'google_event_id' => fake()->optional(0.4)->uuid(),
                'user_id' => $users->random()->id,
            ]);

            foreach (range(1, fake()->numberBetween(5, 20)) as $j) {
                ActivityParticipant::create([
                    'activity_id' => $activity->id,
                    'participant_name' => fake()->name(),
                    'participant_email' => fake()->unique()->safeEmail(),
                ]);
            }
        }
    }
}
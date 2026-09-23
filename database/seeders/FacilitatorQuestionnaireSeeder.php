<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacilitatorQuestionnaireSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            [
                'question_title' => 'Mastery of the Subject Matter',
                'question_text' => 'Demonstrate in-depth knowledge of the topic and answers questions confidently.',
                'question_type' => 'rating',
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Clarity of Presentation',
                'question_text' => 'Presents ideas clearly, logically, and in an organized manner.',
                'question_type' => 'rating',
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Engagement',
                'question_text' => 'Keeps participants\' attention and encourages participation.',
                'question_type' => 'rating',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Use of Training Aids/Materials',
                'question_text' => 'Uses visuals, slides, and system demonstration effectively.',
                'question_type' => 'rating',
                'order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Relevance of Content',
                'question_text' => 'Relates the topic to participants\' roles and needs.',
                'question_type' => 'rating',
                'order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Responsiveness',
                'question_text' => 'Addresses questions and feedback appropriately.',
                'question_type' => 'rating',
                'order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Time Management',
                'question_text' => 'Allocates and manages time effectively for each topic or activity.',
                'question_type' => 'rating',
                'order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Communication Skills',
                'question_text' => 'Speaks audibly, confidently, and with appropriate tone and pace.',
                'question_type' => 'rating',
                'order' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Professionalism',
                'question_text' => 'Demonstrates respect, courtesy, and professional conduct.',
                'question_type' => 'rating',
                'order' => 9,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'What did you like most about the trainer\'s delivery?',
                'question_text' => 'What did you like most about the trainer\'s delivery?',
                'question_type' => 'text',
                'order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'What areas could be improved?',
                'question_text' => 'What areas could be improved?',
                'question_type' => 'text',
                'order' => 11,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'question_title' => 'Other comments or suggestions',
                'question_text' => 'Other comments or suggestions',
                'question_type' => 'text',
                'order' => 12,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert only if questions don't already exist
        DB::table('facilitator_questionnaire')->insertOrIgnore($questions);
    }
}
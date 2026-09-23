<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacilitatorChoicesSeeder extends Seeder
{
    public function run(): void
    {
        $choices = [
            [
                'choice_text' => '1',
                'choice_value' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'choice_text' => '2',
                'choice_value' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'choice_text' => '3',
                'choice_value' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'choice_text' => '4',
                'choice_value' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'choice_text' => '5',
                'choice_value' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('facilitator_choices')->insertOrIgnore($choices);
    }
}
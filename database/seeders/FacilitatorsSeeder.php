<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacilitatorsSeeder extends Seeder
{
    public function run(): void
    {
        $facilitators = [
            ['name' => 'Anna Katrina Yturralde'],
            ['name' => 'Rose Ann Biag'],
            ['name' => 'Dominic Domantay'],
            ['name' => 'Hazer Anthony Policarpio'],
            ['name' => 'Paul Dominic Ilagan'],
            ['name' => 'Krisha May Lingan'],
            ['name' => 'Cristopher Mani'],
            ['name' => 'Mark Anthony Villamin'],
            ['name' => 'Nathaniel Mallari'],
            ['name' => 'Kevin Greg Alvarado'],
        ];

        DB::table('facilitators')->insertOrIgnore($facilitators);
    }
}
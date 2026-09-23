<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UpdateChoiceTextForId113OnQuestionChoices extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('question_choices')
            ->where('id', 113)
            ->update(['choice_text' => 'Health records cannot be printed but can be shown to friends within the RHU premises']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Optionally: revert value if you know the old string.
        // DB::table('question_choices')->where('id', 113)->update(['choice_text' => 'old_value_here']);
    }
}
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UpdateChoiceTextOnQuestionChoices extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('question_choices')
            ->where('id', 40)
            ->update(['choice_text' => 'Health records cannot be printed but can be shown to friends within the RHU premises']);

        DB::table('question_choices')
            ->where('id', 142)
            ->update(['choice_text' => 'Write down the complete name and details of the patient']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Optionally, you can revert to old values if you know them.
        // For example:
        // DB::table('question_choices')->where('id', 40)->update(['choice_text' => 'old_value_here']);
        // DB::table('question_choices')->where('id', 142)->update(['choice_text' => 'old_value_here']);
    }
}
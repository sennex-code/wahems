<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_event_participant_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_attempt_id')->constrained('facilitator_survey_attempts')->onDelete('cascade');
            $table->foreignId('questionnaire_id')->constrained('facilitator_questionnaire')->onDelete('cascade');
            $table->foreignId('choice_id')->nullable()->constrained('facilitator_choices')->onDelete('set null');
            $table->longText('answer_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_event_participant_answers');
    }
};
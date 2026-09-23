<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('event_participant_answers')) {
            Schema::create('event_participant_answers', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
                $table->foreignId('survey_submission_id')->constrained()->cascadeOnDelete();
                $table->foreignId('question_id')->constrained()->cascadeOnDelete();
                $table->foreignId('question_option_id')
                    ->nullable()
                    ->constrained('survey_question_options')
                    ->cascadeOnDelete();
                $table->string('text_answer')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_participant_answers');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_survey_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('facilitator_surveys')->onDelete('cascade');
            $table->foreignId('event_participant_id')->constrained('event_participants')->onDelete('cascade');
            $table->enum('status', ['draft', 'submitted'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_survey_attempts');
    }
};
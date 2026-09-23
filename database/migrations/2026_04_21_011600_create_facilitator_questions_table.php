<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('facilitator_surveys')->onDelete('cascade');
            $table->foreignId('questionnaire_id')->constrained('facilitator_questionnaire')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['survey_id', 'questionnaire_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_questions');
    }
};
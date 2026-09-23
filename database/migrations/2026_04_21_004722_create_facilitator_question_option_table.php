<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_question_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('questionnaire_id')->constrained('facilitator_questionnaire')->onDelete('cascade');
            $table->foreignId('choice_id')->constrained('facilitator_choices')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['questionnaire_id', 'choice_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_question_option');
    }
};
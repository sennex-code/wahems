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
        if (! Schema::hasTable('survey_question_options')) {
            Schema::create('survey_question_options', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
                $table->foreignId('question_id')
                    ->constrained()
                    ->cascadeOnDelete();
                $table->string('label');
                $table->string('value')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_question_options');
    }
};

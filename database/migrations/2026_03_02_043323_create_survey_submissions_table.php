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
        if (! Schema::hasTable('survey_submissions')) {
            Schema::create('survey_submissions', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
                $table->foreignId('survey_id')->constrained()->cascadeOnDelete();
                $table->foreignId('event_participants_id')->constrained()->cascadeOnDelete();
                $table->timestamp('submitted_at');
                $table->unique(['survey_id', 'event_participants_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_submissions');
    }
};

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
        if (! Schema::hasTable('exam_attempts')) {
            Schema::create('exam_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
                $table->foreignId('participant_id')->constrained('event_participants')->cascadeOnDelete();
                $table->integer('score')->default(0);
                $table->dateTime('started_at');
                $table->dateTime('submitted_at')->nullable();
                $table->timestamps();
                $table->unique(['exam_id', 'participant_id'], 'uniq_exam_participant');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};

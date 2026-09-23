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
        if (! Schema::hasTable('exam_questions')) {
            Schema::create('exam_questions', function (Blueprint $table) {
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('exams_questions')->cascadeOnDelete();
                $table->timestamps();
                $table->primary(['exam_id', 'question_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};

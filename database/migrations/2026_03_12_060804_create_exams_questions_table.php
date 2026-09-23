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
        if (! Schema::hasTable('exams_questions')) {
            Schema::create('exams_questions', function (Blueprint $table) {
                $table->id();
                $table->enum('bank', ['private', 'lgu', 'specialized'])->index('idx_exams_questions_bank');
                $table->text('question_text');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams_questions');
    }
};

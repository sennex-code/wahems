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
        if (! Schema::hasTable('question_choices')) {
            Schema::create('question_choices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('question_id')->constrained('exams_questions')->cascadeOnDelete();
                $table->text('choice_text');
                $table->boolean('is_correct')->default(false)->index('idx_question_choices_is_correct');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_choices');
    }
};

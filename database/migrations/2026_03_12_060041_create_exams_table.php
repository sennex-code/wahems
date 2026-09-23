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
        if (! Schema::hasTable('exams')) {
            Schema::create('exams', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained()->cascadeOnDelete();
                $table->enum('exam_type', ['pre', 'post']);
                $table->enum('bank', ['private', 'lgu', 'specialized'])->index('idx_exams_bank');
                $table->string('title');
                $table->timestamps();
                $table->boolean('isActive')->default(0);
                $table->unique(['event_id', 'exam_type'], 'uniq_event_exam_type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};

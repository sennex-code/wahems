<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_questionnaire', function (Blueprint $table) {
            $table->id();
            $table->string('question_title');
            $table->text('question_text');
            $table->enum('question_type', ['text', 'rating'])->default('rating');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_questionnaire');
    }
};
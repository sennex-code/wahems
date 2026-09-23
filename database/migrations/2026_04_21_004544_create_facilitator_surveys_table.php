<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilitator_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facilitator_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Facilitator Evaluation');
            $table->timestamps();
            
            $table->unique(['facilitator_id', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitator_surveys');
    }
};
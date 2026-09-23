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
        if (! Schema::hasTable('event_participants')) {
            Schema::create('event_participants', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('registration_id')->default(0);
                $table->string('participant_cluster')->nullable();
                $table->integer('total_hours_attended')->default(0);
                $table->string('attendance_code');
                $table->foreignId('event_id')->constrained()->cascadeOnDelete();
                $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cluster_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('facility_name')->nullable();
                $table->foreignId('facility_id')->nullable()->constrained()->cascadeOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_participants');
    }
};

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
        if (! Schema::hasTable('cluster_facility')) {
            Schema::create('cluster_facility', function (Blueprint $table) {
                $table->foreignId('cluster_id')->constrained()->cascadeOnDelete();
                $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cluster_facility');
    }
};

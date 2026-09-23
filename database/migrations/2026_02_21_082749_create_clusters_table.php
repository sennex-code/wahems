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
        if (! Schema::hasTable('clusters')) {
            Schema::create('clusters', function (Blueprint $table) {
                $table->id();
                $table->string('cluster_name');
                $table->foreignId('event_id')->constrained()->cascadeOnDelete();
                $table->string('region');
                $table->string('province');
                $table->string('logo')->nullable();
                $table->string('municipality');
                $table->string('barangay');
                $table->string('address');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clusters');
    }
};

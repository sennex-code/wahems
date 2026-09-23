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
        if (! Schema::hasTable('events')) {
            Schema::create('events', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('facility_code')->nullable();
                $table->integer('user_id');
                $table->string('type');
                $table->string('code');
                $table->string('logo')->nullable();
                $table->string('leader');
                $table->string('position');
                $table->string('region');
                $table->string('province');
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
        Schema::dropIfExists('events');
    }
};

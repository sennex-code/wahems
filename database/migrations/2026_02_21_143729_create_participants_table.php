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
        if (! Schema::hasTable('participants')) {
            Schema::create('participants', function (Blueprint $table) {
                $table->id();
                $table->string('first_name');
                $table->string('middle_initial')->nullable();
                $table->string('last_name');
                $table->string('suffix')->nullable();
                $table->string('designation');
                $table->integer('age');
                $table->string('email')->unique();
                $table->string('gender');
                $table->string('mobile_number');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};

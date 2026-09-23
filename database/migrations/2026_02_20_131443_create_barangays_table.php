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
        if (! Schema::hasTable('barangays')) {
            Schema::create('barangays', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('psgc_10_digit_code')->unique();
                $table->foreignId('municipality_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('urban_rural');
                $table->string('population');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangays');
    }
};

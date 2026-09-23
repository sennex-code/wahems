<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The create-event form does not collect barangay (and leader/position
     * are optional), so these columns must be nullable to avoid
     * MySQL 1364 "Field doesn't have a default value" errors.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'barangay')) {
                $table->string('barangay')->nullable()->change();
            }
            if (Schema::hasColumn('events', 'leader')) {
                $table->string('leader')->nullable()->change();
            }
            if (Schema::hasColumn('events', 'position')) {
                $table->string('position')->nullable()->change();
            }
        });

        Schema::table('clusters', function (Blueprint $table) {
            if (Schema::hasColumn('clusters', 'barangay')) {
                $table->string('barangay')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'barangay')) {
                $table->string('barangay')->nullable(false)->change();
            }
            if (Schema::hasColumn('events', 'leader')) {
                $table->string('leader')->nullable(false)->change();
            }
            if (Schema::hasColumn('events', 'position')) {
                $table->string('position')->nullable(false)->change();
            }
        });

        Schema::table('clusters', function (Blueprint $table) {
            if (Schema::hasColumn('clusters', 'barangay')) {
                $table->string('barangay')->nullable(false)->change();
            }
        });
    }
};
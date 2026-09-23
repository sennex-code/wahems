<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The app (Dashboard, Events, Attendance, Certificates, Registration)
     * expects these columns on the events table, but no earlier migration
     * creates them.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'facility')) {
                $table->string('facility')->nullable()->after('type');
            }
            if (! Schema::hasColumn('events', 'start_at')) {
                $table->date('start_at')->nullable()->after('facility');
            }
            if (! Schema::hasColumn('events', 'end_at')) {
                $table->date('end_at')->nullable()->after('start_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['facility', 'start_at', 'end_at']);
        });
    }
};
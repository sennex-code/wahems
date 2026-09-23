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
        if (Schema::hasTable('events') && ! Schema::hasColumn('events', 'required_hours')) {
            Schema::table('events', function (Blueprint $table) {
                $table->integer('required_hours')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('events') && Schema::hasColumn('events', 'required_hours')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('required_hours');
            });
        }
    }
};

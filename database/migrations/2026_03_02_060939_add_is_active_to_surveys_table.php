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
        if (Schema::hasTable('surveys') && ! Schema::hasColumn('surveys', 'is_active')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->boolean('is_active')->default(false);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('surveys') && Schema::hasColumn('surveys', 'is_active')) {
            Schema::table('surveys', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};

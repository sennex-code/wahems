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
        if (Schema::hasTable('activities')) {

            if (!Schema::hasColumn('activities', 'user_id')) {

                Schema::table('activities', function (Blueprint $table) {
                    $table->foreignId('user_id')
                          ->nullable()
                          ->constrained()
                          ->cascadeOnDelete();
                });

            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('activities') && Schema::hasColumn('activities', 'user_id')) {

            Schema::table('activities', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            });

        }
    }
};
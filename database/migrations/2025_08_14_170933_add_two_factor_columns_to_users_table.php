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
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (! Schema::hasColumn('users', 'two_factor_secret')) {
                    $table->text('two_factor_secret')->after('password')->nullable();
                }

                if (! Schema::hasColumn('users', 'two_factor_recovery_codes')) {
                    $table->text('two_factor_recovery_codes')->after('two_factor_secret')->nullable();
                }

                if (! Schema::hasColumn('users', 'two_factor_confirmed_at')) {
                    $table->timestamp('two_factor_confirmed_at')->after('two_factor_recovery_codes')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $columnsToDrop = [];

                if (Schema::hasColumn('users', 'two_factor_secret')) {
                    $columnsToDrop[] = 'two_factor_secret';
                }

                if (Schema::hasColumn('users', 'two_factor_recovery_codes')) {
                    $columnsToDrop[] = 'two_factor_recovery_codes';
                }

                if (Schema::hasColumn('users', 'two_factor_confirmed_at')) {
                    $columnsToDrop[] = 'two_factor_confirmed_at';
                }

                if (! empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }
    }
};

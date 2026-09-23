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
        if (Schema::hasTable('participants')) {
            Schema::table('participants', function (Blueprint $table) {
                if (! Schema::hasColumn('participants', 'cpd')) {
                    $table->boolean('cpd')->nullable();
                }

                if (! Schema::hasColumn('participants', 'prc_license')) {
                    $table->string('prc_license')->nullable();
                }

                if (! Schema::hasColumn('participants', 'expiry_date')) {
                    $table->string('expiry_date')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('participants')) {
            Schema::table('participants', function (Blueprint $table) {
                $columnsToDrop = [];

                if (Schema::hasColumn('participants', 'cpd')) {
                    $columnsToDrop[] = 'cpd';
                }

                if (Schema::hasColumn('participants', 'prc_license')) {
                    $columnsToDrop[] = 'prc_license';
                }

                if (Schema::hasColumn('participants', 'expiry_date')) {
                    $columnsToDrop[] = 'expiry_date';
                }

                if (! empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }
    }
};

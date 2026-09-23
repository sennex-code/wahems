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
        if (Schema::hasTable('clusters') && !Schema::hasColumn('clusters', 'require_signatory')) {
            Schema::table('clusters', function (Blueprint $table) {
                $table->boolean('require_signatory')->default(false);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('clusters') && Schema::hasColumn('clusters', 'require_signatory')) {
            Schema::table('clusters', function (Blueprint $table) {
                $table->dropColumn('require_signatory');
            });
        }
    }
};

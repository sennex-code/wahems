<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('certificates')) {
            Schema::create('certificates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('event_participants_id');
                $table->unsignedBigInteger('event_id');
                $table->boolean('certificate_sent')->default(false);
                $table->string('email');
                $table->timestamps();

                $table->foreign('event_participants_id')
                    ->references('id')
                    ->on('event_participants')
                    ->onDelete('cascade');

                $table->foreign('event_id')
                    ->references('id')
                    ->on('events')
                    ->onDelete('cascade');
            });
        }

        if (
            Schema::hasTable('certificates') &&
            ! Schema::hasColumn('certificates', 'pdf_data')
        ) {
            DB::statement('ALTER TABLE certificates ADD pdf_data LONGBLOB AFTER certificate_sent');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('certificates')) {
            if (Schema::hasColumn('certificates', 'pdf_data')) {
                DB::statement('ALTER TABLE certificates DROP COLUMN pdf_data');
            }

            Schema::dropIfExists('certificates');
        }
    }
};

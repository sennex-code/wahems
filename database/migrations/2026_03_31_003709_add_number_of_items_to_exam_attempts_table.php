<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNumberOfItemsToExamAttemptsTable extends Migration
{
    public function up()
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
           $table->integer('number_of_items')->nullable()->after('exam_id'); // in your migration
        });
    }

    public function down()
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropColumn('number_of_items');
        });
    }
}
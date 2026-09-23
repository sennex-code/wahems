<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::table('users')
            ->where('id', 9)
            ->update([
                'role' => 'Admin',
                'status' => 'Approved',
            ]);
    }

    public function down()
    {
        // Optionally revert the changes if needed
        // Example: set role and status back to some default values
        // DB::table('users')
        //     ->where('id', 9)
        //     ->update([
        //         'role' => 'user',
        //         'status' => 'pending', // or whatever the old status was
        //     ]);
    }
};
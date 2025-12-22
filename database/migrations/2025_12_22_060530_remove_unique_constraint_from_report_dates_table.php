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
        Schema::table('report_dates', function (Blueprint $table) {
            // Add a non-unique index first so the foreign key still has an index
            $table->index('report_link_id');
            
            // Now drop the unique constraint
            $table->dropUnique('report_dates_report_link_id_date_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            $table->unique(['report_link_id', 'date']);
        });
    }
};

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
            // Add report_link_id column
            $table->foreignId('report_link_id')->nullable()->after('id')->constrained('report_links')->onDelete('cascade');
            
            // Remove unique constraint on report_type and date
            $table->dropUnique(['report_type', 'date']);
            
            // Add unique constraint on report_link_id and date
            $table->unique(['report_link_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            // Remove unique constraint on report_link_id and date
            $table->dropUnique(['report_link_id', 'date']);
            
            // Add unique constraint back on report_type and date
            $table->unique(['report_type', 'date']);
            
            // Remove report_link_id column
            $table->dropForeign(['report_link_id']);
            $table->dropColumn('report_link_id');
        });
    }
};

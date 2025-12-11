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
        Schema::table('notulensi_dates', function (Blueprint $table) {
            // Remove unique constraint from date column
            $table->dropUnique(['date']);
            
            // Add unique constraint on combination of date and sheet_id
            // This allows same date in different sheets, but prevents duplicate dates in same sheet
            $table->unique(['date', 'sheet_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notulensi_dates', function (Blueprint $table) {
            // Remove composite unique constraint if it exists
            try {
                $table->dropUnique(['date', 'sheet_id']);
            } catch (\Exception $e) {
                // Ignore if constraint doesn't exist
            }
            
            // Restore unique constraint on date column
            $table->unique('date');
        });
    }
};

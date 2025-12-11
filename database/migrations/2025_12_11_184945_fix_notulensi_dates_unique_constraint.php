<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing unique constraint on date column if it exists
        try {
            DB::statement('ALTER TABLE `notulensi_dates` DROP INDEX `notulensi_dates_date_unique`');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Drop composite unique constraint if it exists (from previous migration)
        try {
            DB::statement('ALTER TABLE `notulensi_dates` DROP INDEX `notulensi_dates_date_sheet_id_unique`');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Add composite unique constraint on date and sheet_id
        // This allows same date in different sheets, but prevents duplicate dates in same sheet
        DB::statement('ALTER TABLE `notulensi_dates` ADD UNIQUE KEY `notulensi_dates_date_sheet_id_unique` (`date`, `sheet_id`)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop composite unique constraint
        try {
            DB::statement('ALTER TABLE `notulensi_dates` DROP INDEX `notulensi_dates_date_sheet_id_unique`');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Restore unique constraint on date column
        DB::statement('ALTER TABLE `notulensi_dates` ADD UNIQUE KEY `notulensi_dates_date_unique` (`date`)');
    }
};
